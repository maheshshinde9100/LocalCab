package com.mahesh.LocalCab.booking;

import com.mahesh.LocalCab.driver.Driver;
import com.mahesh.LocalCab.driver.DriverRepository;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final DriverRepository driverRepository;

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
                .requestedAt(Instant.now())
                .build();

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
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
        return toResponse(saved);
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
        return toResponse(saved);
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


