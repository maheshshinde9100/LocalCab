package com.mahesh.LocalCab.driver;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.mahesh.LocalCab.driver.DriverDtos.DriverResponse;
import static com.mahesh.LocalCab.driver.DriverDtos.RegisterDriverRequest;
import static com.mahesh.LocalCab.driver.DriverDtos.UpdateDriverProfileRequest;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @PostMapping("/register")
    public ResponseEntity<DriverResponse> register(@Valid @RequestBody RegisterDriverRequest request) {
        DriverResponse response = driverService.registerDriver(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/available")
    public ResponseEntity<List<DriverResponse>> findAvailableByLocation(@RequestParam("query") String query) {
        List<DriverResponse> drivers = driverService.findAvailableDriversByLocation(query);
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/me")
    public ResponseEntity<DriverResponse> getMyProfile() {
        return ResponseEntity.ok(driverService.getCurrentDriverProfile());
    }

    @PatchMapping("/{driverId}/availability")
    public ResponseEntity<Void> updateAvailability(
            @PathVariable("driverId") String driverId,
            @RequestParam("available") boolean available
    ) {
        driverService.updateAvailability(driverId, available);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{driverId}/profile")
    public ResponseEntity<DriverResponse> updateProfile(
            @PathVariable("driverId") String driverId,
            @Valid @RequestBody UpdateDriverProfileRequest updateRequest
    ) {
        DriverResponse updated = driverService.updateProfile(driverId, updateRequest);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{driverId}/location")
    public ResponseEntity<DriverResponse> updateLocation(
            @PathVariable("driverId") String driverId,
            @Valid @RequestBody DriverDtos.UpdateLocationRequest request
    ) {
        DriverResponse updated = driverService.updateLocation(driverId, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{driverId}")
    public ResponseEntity<DriverResponse> getProfile(@PathVariable("driverId") String driverId) {
        DriverResponse response = driverService.getDriverById(driverId);
        return ResponseEntity.ok(response);
    }
}
