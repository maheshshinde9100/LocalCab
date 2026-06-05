package com.mahesh.LocalCab.rider;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/riders")
@RequiredArgsConstructor
public class RiderController {

    private final RiderService riderService;

    @PostMapping("/register")
    public ResponseEntity<RiderDtos.AuthResponse> register(@Valid @RequestBody RiderDtos.RegisterRequest request) {
        return ResponseEntity.ok(riderService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<RiderDtos.AuthResponse> login(@Valid @RequestBody RiderDtos.LoginRequest request) {
        return ResponseEntity.ok(riderService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<RiderDtos.RiderResponse> getMyProfile() {
        return ResponseEntity.ok(riderService.getCurrentRiderProfile());
    }

    @GetMapping("/profile/{riderId}")
    public ResponseEntity<RiderDtos.RiderResponse> getProfile(@PathVariable String riderId) {
        return ResponseEntity.ok(riderService.getRiderProfile(riderId));
    }

    @PutMapping("/profile/{riderId}/location")
    public ResponseEntity<RiderDtos.RiderResponse> updateLocation(
            @PathVariable String riderId,
            @RequestBody RiderDtos.UpdateLocationRequest request
    ) {
        return ResponseEntity.ok(riderService.updateLocation(riderId, request));
    }
}
