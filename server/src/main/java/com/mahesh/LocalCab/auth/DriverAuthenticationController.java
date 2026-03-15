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

import java.util.Map;

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
        var driverOpt = driverRepository.findByPhoneNumber(request.getPhoneNumber())
                .filter(driver -> passwordEncoder.matches(request.getPassword(), driver.getPasswordHash()));
        if (driverOpt.isPresent()) {
            return ResponseEntity.ok(buildLoginResponse(driverOpt.get()));
        }
        Map<String, String> error = Map.of("message", "Invalid phone number or password");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    private LoginResponse buildLoginResponse(Driver driver) {
        String token = jwtService.generateToken(driver.getPhoneNumber());
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setDriverId(driver.getId());
        response.setFullName(driver.getFullName());
        response.setPhoneNumber(driver.getPhoneNumber());
        response.setVerified(driver.isVerified());
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
        private boolean verified;
    }
}


