package com.mahesh.LocalCab.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.mahesh.LocalCab.admin.AdminDtos.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    /**
     * Admin-only: Get all drivers with pagination.
     */
    @GetMapping("/drivers")
    public ResponseEntity<List<DriverSummaryResponse>> getAllDrivers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<DriverSummaryResponse> drivers = adminService.getAllDrivers(page, size);
        return ResponseEntity.ok(drivers);
    }

    /**
     * Admin-only: Get driver by ID.
     */
    @GetMapping("/drivers/{driverId}")
    public ResponseEntity<DriverSummaryResponse> getDriverById(@PathVariable String driverId) {
        DriverSummaryResponse driver = adminService.getDriverById(driverId);
        return ResponseEntity.ok(driver);
    }

    /**
     * Admin-only: Block a driver (set available to false).
     */
    @PostMapping("/drivers/{driverId}/block")
    public ResponseEntity<DriverSummaryResponse> blockDriver(@PathVariable String driverId) {
        DriverSummaryResponse driver = adminService.blockDriver(driverId);
        return ResponseEntity.ok(driver);
    }

    /**
     * Admin-only: Unblock a driver (set available to true).
     */
    @PostMapping("/drivers/{driverId}/unblock")
    public ResponseEntity<DriverSummaryResponse> unblockDriver(@PathVariable String driverId) {
        DriverSummaryResponse driver = adminService.unblockDriver(driverId);
        return ResponseEntity.ok(driver);
    }

    /**
     * Admin-only: Get all bookings with pagination.
     */
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingSummaryResponse>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<BookingSummaryResponse> bookings = adminService.getAllBookings(page, size);
        return ResponseEntity.ok(bookings);
    }

    /**
     * Admin-only: Get booking by ID.
     */
    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<BookingSummaryResponse> getBookingById(@PathVariable String bookingId) {
        BookingSummaryResponse booking = adminService.getBookingById(bookingId);
        return ResponseEntity.ok(booking);
    }

    /**
     * Admin-only: Get platform statistics.
     */
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getAdminStats() {
        AdminStatsResponse stats = adminService.getAdminStats();
        return ResponseEntity.ok(stats);
    }
}

