package com.mahesh.LocalCab.booking;

import com.mahesh.LocalCab.driver.Driver;
import com.mahesh.LocalCab.driver.DriverRepository;
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
    private final BookingSseService bookingSseService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.currency}")
    private String razorpayCurrency;

    public BookingService(
            BookingRepository bookingRepository,
            DriverRepository driverRepository,
            BookingSseService bookingSseService
    ) {
        this.bookingRepository = bookingRepository;
        this.driverRepository = driverRepository;
        this.bookingSseService = bookingSseService;
    }

    public BookingResponse createBooking(CreateBookingRequest request) {
        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        Booking booking = Booking.builder()
                .driverId(driver.getId())
                .driverPhoneNumber(driver.getPhoneNumber())
                .riderId(request.getRiderId())
                .riderName(request.getRiderName())
                .riderPhoneNumber(request.getRiderPhoneNumber())
                .pickupVillage(request.getPickupVillage())
                .pickupLandmark(request.getPickupLandmark())
                .dropLocation(request.getDropLocation())
                .pickupLatitude(request.getPickupLatitude())
                .pickupLongitude(request.getPickupLongitude())
                .dropLatitude(request.getDropLatitude())
                .dropLongitude(request.getDropLongitude())
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

    public BookingResponse cancelBookingByRider(String bookingId, String riderId, UpdateStatusRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!riderId.equals(booking.getRiderId())) {
            throw new SecurityException("You are not allowed to cancel this booking");
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

        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            // Convert agreedFare (INR) to paise (1 INR = 100 paise)
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
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Razorpay Order: " + e.getMessage(), e);
        }
    }

    public BookingResponse verifyRazorpayPayment(String bookingId, String razorpayPaymentId, String razorpaySignature) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

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
            } else {
                booking.setPaymentStatus("FAILED");
                throw new IllegalArgumentException("Payment signature verification failed");
            }

            Booking saved = bookingRepository.save(booking);
            BookingResponse response = toResponse(saved);
            bookingSseService.publish(saved.getId(), response);
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Payment verification failed: " + e.getMessage(), e);
        }
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



