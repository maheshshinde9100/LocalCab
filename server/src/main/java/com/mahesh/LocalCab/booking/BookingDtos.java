package com.mahesh.LocalCab.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

public class BookingDtos {

    @Data
    public static class CreateBookingRequest {

        @NotBlank
        private String driverId;

        @NotBlank
        private String riderName;

        @NotBlank
        private String riderPhoneNumber;

        @NotBlank
        private String pickupVillage;

        private String pickupLandmark;

        @NotBlank
        private String dropLocation;

        @NotNull
        private Double agreedFare;
    }

    @Data
    public static class UpdateStatusRequest {
        @NotNull
        private BookingStatus status;
    }

    @Data
    @Builder
    public static class BookingResponse {
        private String id;
        private String driverId;
        private String driverPhoneNumber;
        private String riderName;
        private String riderPhoneNumber;
        private String pickupVillage;
        private String pickupLandmark;
        private String dropLocation;
        private Double agreedFare;
        private BookingStatus status;
        private Instant createdAt;
    }
}


