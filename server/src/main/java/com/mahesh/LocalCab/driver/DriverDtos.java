package com.mahesh.LocalCab.driver;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;

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
    @Builder
    public static class DriverResponse {
        private String id;
        private String fullName;
        private String phoneNumber;
        private String village;
        private String taluka;
        private String district;
        private String state;
        private String pincode;
        private String vehicleType;
        private String vehicleModel;
        private String vehicleNumber;
        private Integer totalSeats;
        private boolean available;
        private boolean verified;
    }
}


