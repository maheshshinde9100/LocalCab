package com.mahesh.LocalCab.driver;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class DriverDtos {

    @Data
    public static class RegisterDriverRequest {

        @NotBlank
        private String fullName;

        @NotBlank
        @Size(min = 10, max = 20)
        private String phoneNumber;

        @NotBlank
        @Size(min = 6, max = 100)
        private String password;

        @NotBlank
        private String village;

        private String taluka;
        private String district;
        private String state;

        @NotBlank
        @Pattern(regexp = "\\d{6}", message = "Pincode must be 6 digits")
        private String pincode;

        @NotBlank
        private String vehicleType;

        private String vehicleModel;

        @NotBlank
        private String vehicleNumber;

        private Integer totalSeats;
    }

    @Data
    public static class UpdateDriverProfileRequest {
        @NotBlank
        private String fullName;

        @NotBlank
        private String village;

        private String taluka;
        private String district;
        private String state;

        @NotBlank
        @Pattern(regexp = "\\d{6}", message = "Pincode must be 6 digits")
        private String pincode;

        @NotBlank
        private String vehicleType;

        private String vehicleModel;

        @NotBlank
        private String vehicleNumber;

        private Integer totalSeats;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DriverResponse {
        private String id;
        private String fullName;
        private String phoneNumber;
        private String village;
        private String taluka;
        private String district;
        private String state;
        private String pincode;
        private Double latitude;
        private Double longitude;
        private String vehicleType;
        private String vehicleModel;
        private String vehicleNumber;
        private Integer totalSeats;
        private boolean available;
        private boolean verified;
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
