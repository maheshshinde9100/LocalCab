package com.mahesh.LocalCab.auth;

import com.mahesh.LocalCab.admin.AdminUserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/admin")
@RequiredArgsConstructor
public class AdminAuthenticationController {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequest request) {
        var adminOpt = adminUserRepository.findByUsername(request.getUsername())
                .filter(admin -> passwordEncoder.matches(request.getPassword(), admin.getPasswordHash()));

        if (adminOpt.isPresent()) {
            String token = jwtService.generateToken(adminOpt.get().getUsername(), "ADMIN");
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "username", adminOpt.get().getUsername(),
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
