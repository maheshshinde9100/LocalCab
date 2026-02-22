package com.mahesh.LocalCab.booking;

import com.mahesh.LocalCab.driver.Driver;
import com.mahesh.LocalCab.driver.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

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
                .riderName(request.getRiderName())
                .riderPhoneNumber(request.getRiderPhoneNumber())
                .pickupVillage(request.getPickupVillage())
                .pickupLandmark(request.getPickupLandmark())
                .dropLocation(request.getDropLocation())
                .agreedFare(request.getAgreedFare())
                .status(BookingStatus.REQUESTED)
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

    public BookingResponse updateStatus(String bookingId, UpdateStatusRequest request) {
        Driver driver = getCurrentDriver();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getDriverId().equals(driver.getId())) {
            throw new SecurityException("You are not allowed to modify this booking");
        }

        booking.setStatus(request.getStatus());
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
                .riderName(booking.getRiderName())
                .riderPhoneNumber(booking.getRiderPhoneNumber())
                .pickupVillage(booking.getPickupVillage())
                .pickupLandmark(booking.getPickupLandmark())
                .dropLocation(booking.getDropLocation())
                .agreedFare(booking.getAgreedFare())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}


