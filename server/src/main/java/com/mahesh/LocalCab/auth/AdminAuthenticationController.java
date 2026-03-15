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

    @org.springframework.beans.factory.annotation.Value("${localcab.admin.username}")
    private String adminUsername;

    @org.springframework.beans.factory.annotation.Value("${localcab.admin.password}")
    private String adminPassword;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequest request) {
        if (adminUsername.equals(request.getUsername()) && adminPassword.equals(request.getPassword())) {
            String token = jwtService.generateToken(adminUsername);
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "username", adminUsername,
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
