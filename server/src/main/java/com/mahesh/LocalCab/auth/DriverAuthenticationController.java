package com.mahesh.LocalCab.auth;

import com.mahesh.LocalCab.driver.Driver;
import com.mahesh.LocalCab.driver.DriverRepository;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/driver")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DriverAuthenticationController {

    private final DriverRepository driverRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return driverRepository.findByPhoneNumber(request.getPhoneNumber())
                .filter(driver -> passwordEncoder.matches(request.getPassword(), driver.getPasswordHash()))
                .map(this::buildLoginResponse)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid phone number or password"));
    }

    private LoginResponse buildLoginResponse(Driver driver) {
        String token = jwtService.generateToken(driver.getPhoneNumber());
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setDriverId(driver.getId());
        response.setFullName(driver.getFullName());
        response.setPhoneNumber(driver.getPhoneNumber());
        return response;
    }

    @Data
    public static class LoginRequest {
        @NotBlank
        private String phoneNumber;

        @NotBlank
        private String password;
    }

    @Data
    public static class LoginResponse {
        private String token;
        private String driverId;
        private String fullName;
        private String phoneNumber;
    }
}


