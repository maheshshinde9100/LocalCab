package com.mahesh.LocalCab.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.mahesh.LocalCab.admin.AdminDtos.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/drivers")
    public ResponseEntity<List<DriverSummaryResponse>> getAllDrivers(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(adminService.getAllDrivers(page, size));
    }

    @GetMapping("/drivers/pending")
    public ResponseEntity<List<DriverSummaryResponse>> getPendingDrivers() {
        return ResponseEntity.ok(adminService.getPendingDrivers());
    }

    @GetMapping("/drivers/{driverId}")
    public ResponseEntity<DriverSummaryResponse> getDriverById(@PathVariable("driverId") String driverId) {
        return ResponseEntity.ok(adminService.getDriverById(driverId));
    }

    @PostMapping("/drivers/{driverId}/verify")
    public ResponseEntity<DriverSummaryResponse> verifyDriver(@PathVariable("driverId") String driverId) {
        return ResponseEntity.ok(adminService.verifyDriver(driverId));
    }

    @PostMapping("/drivers/{driverId}/block")
    public ResponseEntity<DriverSummaryResponse> blockDriver(@PathVariable("driverId") String driverId) {
        return ResponseEntity.ok(adminService.blockDriver(driverId));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingSummaryResponse>> getAllBookings(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(adminService.getAllBookings(page, size));
    }

    @GetMapping("/riders")
    public ResponseEntity<List<RiderSummaryResponse>> getAllRiders() {
        return ResponseEntity.ok(adminService.getAllRiders());
    }

    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<BookingSummaryResponse> getBookingById(@PathVariable("bookingId") String bookingId) {
        return ResponseEntity.ok(adminService.getBookingById(bookingId));
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getAdminStats() {
        return ResponseEntity.ok(adminService.getAdminStats());
    }
}
