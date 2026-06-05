package com.mahesh.LocalCab.booking;

import com.mahesh.LocalCab.config.GeocodingService;
import com.mahesh.LocalCab.driver.Driver;
import com.mahesh.LocalCab.driver.DriverRepository;
import com.mahesh.LocalCab.rider.RiderRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import static com.mahesh.LocalCab.booking.BookingDtos.BookingResponse;
import static com.mahesh.LocalCab.booking.BookingDtos.CreateBookingRequest;
import static com.mahesh.LocalCab.booking.BookingDtos.UpdateStatusRequest;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final DriverRepository driverRepository;
    private final RiderRepository riderRepository;
    private final BookingSseService bookingSseService;
    private final GeocodingService geocodingService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.currency}")
    private String razorpayCurrency;

    public BookingService(
            BookingRepository bookingRepository,
            DriverRepository driverRepository,
            RiderRepository riderRepository,
            BookingSseService bookingSseService,
            GeocodingService geocodingService
    ) {
        this.bookingRepository = bookingRepository;
        this.driverRepository = driverRepository;
        this.riderRepository = riderRepository;
        this.bookingSseService = bookingSseService;
        this.geocodingService = geocodingService;
    }

    public BookingResponse createBooking(CreateBookingRequest request) {
        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        if (!driver.isVerified()) {
            throw new IllegalArgumentException("Selected driver is not verified yet");
        }

        Double pickupLat = request.getPickupLatitude();
        Double pickupLng = request.getPickupLongitude();
        Double dropLat = request.getDropLatitude();
        Double dropLng = request.getDropLongitude();

        if (pickupLat == null || pickupLng == null) {
            double[] pickupCoords = geocodingService.geocode(request.getPickupVillage());
            if (pickupCoords != null) {
                pickupLat = pickupCoords[0];
                pickupLng = pickupCoords[1];
            }
        }
        if (dropLat == null || dropLng == null) {
            double[] dropCoords = geocodingService.geocode(request.getDropLocation());
            if (dropCoords != null) {
                dropLat = dropCoords[0];
                dropLng = dropCoords[1];
            }
        }

        Booking booking = Booking.builder()
                .driverId(driver.getId())
                .driverPhoneNumber(driver.getPhoneNumber())
                .riderId(request.getRiderId())
                .riderName(request.getRiderName())
                .riderPhoneNumber(request.getRiderPhoneNumber())
                .pickupVillage(request.getPickupVillage())
                .pickupLandmark(request.getPickupLandmark())
                .dropLocation(request.getDropLocation())
                .pickupLatitude(pickupLat)
                .pickupLongitude(pickupLng)
                .dropLatitude(dropLat)
                .dropLongitude(dropLng)
                .agreedFare(request.getAgreedFare())
                .distanceKm(request.getDistanceKm())
                .status(BookingStatus.REQUESTED)
                .paymentStatus("PENDING")
                .paymentMethod("NONE")
                .requestedAt(Instant.now())
                .build();

        Booking saved = bookingRepository.save(booking);
        BookingResponse response = toResponse(saved);
        bookingSseService.publish(saved.getId(), response);
        return response;
    }

    public List<BookingResponse> getBookingsForCurrentDriver() {
        Driver driver = getCurrentDriver();
        return bookingRepository.findByDriverIdOrderByCreatedAtDesc(driver.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingsByRiderId(String riderId) {
        return bookingRepository.findByRiderIdOrderByCreatedAtDesc(riderId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingsForCurrentRider() {
        com.mahesh.LocalCab.rider.Rider rider = getCurrentRider();
        return getBookingsByRiderId(rider.getId());
    }

    public BookingResponse getBookingById(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        return toResponse(booking);
    }

    public BookingResponse updateStatus(String bookingId, UpdateStatusRequest request) {
        Driver driver = getCurrentDriver();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getDriverId().equals(driver.getId())) {
            throw new SecurityException("You are not allowed to modify this booking");
        }

        validateDriverStatusTransition(booking, request.getStatus());

        booking.setStatus(request.getStatus());

        switch (request.getStatus()) {
            case CONFIRMED -> booking.setConfirmedAt(Instant.now());
            case ONGOING -> booking.setOngoingAt(Instant.now());
            case COMPLETED -> booking.setCompletedAt(Instant.now());
            case CANCELLED -> {
                booking.setCancelledAt(Instant.now());
                booking.setCancellationReason(request.getCancellationReason());
                booking.setCancelledBy("DRIVER");
            }
            default -> {}
        }

        Booking saved = bookingRepository.save(booking);
        BookingResponse response = toResponse(saved);
        bookingSseService.publish(saved.getId(), response);
        return response;
    }

    private void validateDriverStatusTransition(Booking booking, BookingStatus newStatus) {
        BookingStatus current = booking.getStatus();
        switch (newStatus) {
            case CONFIRMED -> {
                if (current != BookingStatus.REQUESTED) {
                    throw new IllegalArgumentException("Only REQUESTED bookings can be confirmed");
                }
            }
            case ONGOING -> {
                if (current != BookingStatus.BOOKED) {
                    throw new IllegalArgumentException("Trip can only start after customer payment (BOOKED status)");
                }
                if (!"COMPLETED".equals(booking.getPaymentStatus())) {
                    throw new IllegalArgumentException("Payment must be completed before starting the trip");
                }
            }
            case COMPLETED -> {
                if (current != BookingStatus.ONGOING) {
                    throw new IllegalArgumentException("Only ONGOING trips can be completed");
                }
            }
            case CANCELLED -> {
                if (current == BookingStatus.COMPLETED || current == BookingStatus.ONGOING) {
                    throw new IllegalArgumentException("Cannot cancel a trip that is already in progress or completed");
                }
            }
            default -> throw new IllegalArgumentException("Invalid status transition");
        }
    }

    public BookingResponse cancelBookingByRider(String bookingId, String riderId, UpdateStatusRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getRiderId() != null && !riderId.equals(booking.getRiderId())) {
            throw new SecurityException("You are not allowed to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.ONGOING
                || booking.getStatus() == BookingStatus.COMPLETED
                || booking.getStatus() == BookingStatus.BOOKED) {
            throw new IllegalArgumentException("Cannot cancel booking at this stage");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(Instant.now());
        booking.setCancellationReason(request.getCancellationReason());
        booking.setCancelledBy("RIDER");

        Booking saved = bookingRepository.save(booking);
        BookingResponse response = toResponse(saved);
        bookingSseService.publish(saved.getId(), response);
        return response;
    }

    public BookingResponse updateLocation(String bookingId, Double latitude, Double longitude) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        booking.setDriverLatitude(latitude);
        booking.setDriverLongitude(longitude);

        Booking saved = bookingRepository.save(booking);
        BookingResponse response = toResponse(saved);
        bookingSseService.publish(saved.getId(), response);
        return response;
    }

    public String getRazorpayKeyId() {
        return razorpayKeyId;
    }

    public BookingResponse createRazorpayOrder(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        assertRiderOwnsBooking(booking);

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalArgumentException("Payment is only available after the driver accepts your ride");
        }
        if ("COMPLETED".equals(booking.getPaymentStatus())) {
            throw new IllegalArgumentException("Payment already completed for this booking");
        }

        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            int amountInPaise = (int) Math.round(booking.getAgreedFare() * 100);
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", razorpayCurrency);
            orderRequest.put("receipt", "receipt_" + bookingId);

            Order order = razorpayClient.orders.create(orderRequest);
            String orderId = order.get("id");

            booking.setRazorpayOrderId(orderId);
            booking.setPaymentStatus("PENDING");
            booking.setPaymentMethod("RAZORPAY");

            Booking saved = bookingRepository.save(booking);
            BookingResponse response = toResponse(saved);
            bookingSseService.publish(saved.getId(), response);
            return response;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to create Razorpay Order: " + e.getMessage());
        }
    }

    public BookingResponse verifyRazorpayPayment(String bookingId, String razorpayPaymentId, String razorpaySignature) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        assertRiderOwnsBooking(booking);

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalArgumentException("Payment verification not allowed at this stage");
        }

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", booking.getRazorpayOrderId());
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isSignatureValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (isSignatureValid) {
                booking.setPaymentStatus("COMPLETED");
                booking.setRazorpayPaymentId(razorpayPaymentId);
                booking.setPaymentMethod("RAZORPAY");
                booking.setStatus(BookingStatus.BOOKED);
                booking.setBookedAt(Instant.now());
            } else {
                booking.setPaymentStatus("FAILED");
                throw new IllegalArgumentException("Payment signature verification failed");
            }

            Booking saved = bookingRepository.save(booking);
            BookingResponse response = toResponse(saved);
            bookingSseService.publish(saved.getId(), response);
            return response;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Payment verification failed: " + e.getMessage());
        }
    }

    private void assertRiderOwnsBooking(Booking booking) {
        com.mahesh.LocalCab.rider.Rider rider = getCurrentRider();
        if (booking.getRiderId() != null && !booking.getRiderId().equals(rider.getId())) {
            throw new SecurityException("You are not allowed to pay for this booking");
        }
    }

    private com.mahesh.LocalCab.rider.Rider getCurrentRider() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new SecurityException("Rider not authenticated");
        }
        return riderRepository.findByPhoneNumber(authentication.getName())
                .orElseThrow(() -> new SecurityException("Rider not found"));
    }

    private Driver getCurrentDriver() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new SecurityException("Driver not authenticated");
        }

        String phoneNumber = authentication.getName();
        return driverRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new SecurityException("Driver not found for phone: " + phoneNumber));
    }

    private BookingResponse toResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .driverId(booking.getDriverId())
                .driverPhoneNumber(booking.getDriverPhoneNumber())
                .riderId(booking.getRiderId())
                .riderName(booking.getRiderName())
                .riderPhoneNumber(booking.getRiderPhoneNumber())
                .pickupVillage(booking.getPickupVillage())
                .pickupLandmark(booking.getPickupLandmark())
                .dropLocation(booking.getDropLocation())
                .pickupLatitude(booking.getPickupLatitude())
                .pickupLongitude(booking.getPickupLongitude())
                .dropLatitude(booking.getDropLatitude())
                .dropLongitude(booking.getDropLongitude())
                .agreedFare(booking.getAgreedFare())
                .distanceKm(booking.getDistanceKm())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .paymentMethod(booking.getPaymentMethod())
                .razorpayOrderId(booking.getRazorpayOrderId())
                .razorpayPaymentId(booking.getRazorpayPaymentId())
                .driverLatitude(booking.getDriverLatitude())
                .driverLongitude(booking.getDriverLongitude())
                .requestedAt(booking.getRequestedAt())
                .confirmedAt(booking.getConfirmedAt())
                .bookedAt(booking.getBookedAt())
                .ongoingAt(booking.getOngoingAt())
                .completedAt(booking.getCompletedAt())
                .cancelledAt(booking.getCancelledAt())
                .cancellationReason(booking.getCancellationReason())
                .cancelledBy(booking.getCancelledBy())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
