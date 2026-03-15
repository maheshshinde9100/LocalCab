package com.mahesh.LocalCab.auth;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminAuthenticationController {

    private final JwtService jwtService;

    // Hardcoded credentials as requested by user
    private static final String ADMIN_USERNAME = "admin-mahesh";
    private static final String ADMIN_PASSWORD = "Mahesh@123";

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequest request) {
        if (ADMIN_USERNAME.equals(request.getUsername()) && ADMIN_PASSWORD.equals(request.getPassword())) {
            String token = jwtService.generateToken(ADMIN_USERNAME);
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "username", ADMIN_USERNAME,
                    "role", "ADMIN"
            ));
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid admin credentials"));
    }

    @Data
    public static class AdminLoginRequest {
        private String username;
        private String password;
    }
}
