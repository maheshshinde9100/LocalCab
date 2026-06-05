package com.mahesh.LocalCab.config;

import com.mahesh.LocalCab.admin.AdminUser;
import com.mahesh.LocalCab.admin.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminDataInitializer implements ApplicationRunner {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${localcab.admin.username}")
    private String adminUsername;

    @Value("${localcab.admin.password}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        if (!adminUserRepository.existsByUsername(adminUsername)) {
            adminUserRepository.save(AdminUser.builder()
                    .username(adminUsername)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .build());
        }
    }
}
