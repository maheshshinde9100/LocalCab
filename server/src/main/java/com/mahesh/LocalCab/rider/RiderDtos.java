package com.mahesh.LocalCab.rider;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class RiderDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank
        private String fullName;

        @NotBlank
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid phone number")
        private String phoneNumber;

        @NotBlank
        private String password;

        private String email;
        private String village;
        private String taluka;
        private String district;
        private String state;
        private String pincode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank
        private String phoneNumber;

        @NotBlank
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private RiderResponse rider;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiderResponse {
        private String id;
        private String fullName;
        private String phoneNumber;
        private String email;
        private String village;
        private String taluka;
        private String district;
        private String state;
        private String pincode;
        private Double latitude;
        private Double longitude;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateLocationRequest {
        private Double latitude;
        private Double longitude;
    }
}
