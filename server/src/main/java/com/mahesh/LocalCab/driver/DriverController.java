package com.mahesh.LocalCab.driver;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.mahesh.LocalCab.driver.DriverDtos.DriverResponse;
import static com.mahesh.LocalCab.driver.DriverDtos.RegisterDriverRequest;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DriverController {

    private final DriverService driverService;

    @PostMapping("/register")
    public ResponseEntity<DriverResponse> register(@Valid @RequestBody RegisterDriverRequest request) {
        DriverResponse response = driverService.registerDriver(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Public endpoint: list available taxis by pincode.
     * Frontend can show this list and allow user to tap to call the driver.
     */
    @GetMapping("/available")
    public ResponseEntity<List<DriverResponse>> findAvailableByLocation(@RequestParam("query") String query) {
        List<DriverResponse> drivers = driverService.findAvailableDriversByLocation(query);
        return ResponseEntity.ok(drivers);
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
            @Valid @RequestBody RegisterDriverRequest updateRequest
    ) {
        DriverResponse updated = driverService.updateProfile(driverId, updateRequest);
        return ResponseEntity.ok(updated);
    }
}


