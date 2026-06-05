package com.mahesh.LocalCab.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

public class BookingDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateBookingRequest {
        @NotBlank
        private String driverId;

        private String riderId;

        @NotBlank
        private String riderName;

        @NotBlank
        private String riderPhoneNumber;

        @NotBlank
        private String pickupVillage;

        private String pickupLandmark;

        @NotBlank
        private String dropLocation;

        private Double pickupLatitude;
        private Double pickupLongitude;
        private Double dropLatitude;
        private Double dropLongitude;

        @NotNull
        private Double agreedFare;
        private Double distanceKm;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStatusRequest {
        @NotNull
        private BookingStatus status;
        private String cancellationReason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingResponse {
        private String id;
        private String driverId;
        private String driverPhoneNumber;
        private String riderId;
        private String riderName;
        private String riderPhoneNumber;
        private String pickupVillage;
        private String pickupLandmark;
        private String dropLocation;
        private Double pickupLatitude;
        private Double pickupLongitude;
        private Double dropLatitude;
        private Double dropLongitude;
        private Double agreedFare;
        private Double distanceKm;
        private BookingStatus status;
        private Instant requestedAt;
        private Instant confirmedAt;
        private Instant ongoingAt;
        private Instant completedAt;
        private Instant cancelledAt;
        private String cancellationReason;
        private String cancelledBy;
        private String paymentStatus;
        private String paymentMethod;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private Double driverLatitude;
        private Double driverLongitude;
        private Instant createdAt;
        private Instant updatedAt;
    }
}


