package com.mahesh.LocalCab.admin;

import com.mahesh.LocalCab.booking.Booking;
import com.mahesh.LocalCab.booking.BookingRepository;
import com.mahesh.LocalCab.booking.BookingStatus;
import com.mahesh.LocalCab.driver.Driver;
import com.mahesh.LocalCab.driver.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static com.mahesh.LocalCab.admin.AdminDtos.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final DriverRepository driverRepository;
    private final BookingRepository bookingRepository;

    public List<DriverSummaryResponse> getAllDrivers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Driver> drivers = driverRepository.findAll(pageable);
        return drivers.getContent().stream()
                .map(this::toDriverSummary)
                .collect(Collectors.toList());
    }

    public DriverSummaryResponse getDriverById(String driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
        return toDriverSummary(driver);
    }

    public DriverSummaryResponse blockDriver(String driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
        driver.setVerified(false);
        Driver saved = driverRepository.save(driver);
        return toDriverSummary(saved);
    }

    public DriverSummaryResponse unblockDriver(String driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
        driver.setVerified(true);
        Driver saved = driverRepository.save(driver);
        return toDriverSummary(saved);
    }

    public List<BookingSummaryResponse> getAllBookings(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookings = bookingRepository.findAll(pageable);
        return bookings.getContent().stream()
                .map(this::toBookingSummary)
                .collect(Collectors.toList());
    }

    public List<RiderSummaryResponse> getAllRiders() {
        List<Booking> allBookings = bookingRepository.findAll();
        return allBookings.stream()
                .collect(Collectors.groupingBy(Booking::getRiderPhoneNumber))
                .entrySet().stream()
                .map(entry -> {
                    Booking first = entry.getValue().get(0);
                    return RiderSummaryResponse.builder()
                            .riderName(first.getRiderName())
                            .riderPhoneNumber(entry.getKey())
                            .totalBookings((long) entry.getValue().size())
                            .build();
                })
                .collect(Collectors.toList());
    }

    public BookingSummaryResponse getBookingById(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        return toBookingSummary(booking);
    }

    public AdminStatsResponse getAdminStats() {
        long totalDrivers = driverRepository.count();
        long availableDrivers = driverRepository.countByAvailableTrueAndVerifiedTrue();
        long totalBookings = bookingRepository.count();
        long completedBookings = bookingRepository.countByStatus(BookingStatus.COMPLETED);
        long ongoingBookings = bookingRepository.countByStatus(BookingStatus.ONGOING);

        return AdminStatsResponse.builder()
                .totalDrivers(totalDrivers)
                .availableDrivers(availableDrivers)
                .totalBookings(totalBookings)
                .completedBookings(completedBookings)
                .ongoingBookings(ongoingBookings)
                .build();
    }

    private DriverSummaryResponse toDriverSummary(Driver driver) {
        return DriverSummaryResponse.builder()
                .id(driver.getId())
                .fullName(driver.getFullName())
                .phoneNumber(driver.getPhoneNumber())
                .village(driver.getVillage())
                .taluka(driver.getTaluka())
                .district(driver.getDistrict())
                .state(driver.getState())
                .pincode(driver.getPincode())
                .vehicleType(driver.getVehicleType())
                .vehicleModel(driver.getVehicleModel())
                .vehicleNumber(driver.getVehicleNumber())
                .totalSeats(driver.getTotalSeats())
                .available(driver.isAvailable())
                .verified(driver.isVerified())
                .createdAt(driver.getCreatedAt())
                .build();
    }

    private BookingSummaryResponse toBookingSummary(Booking booking) {
        return BookingSummaryResponse.builder()
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

