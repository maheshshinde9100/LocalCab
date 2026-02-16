package com.mahesh.LocalCab.admin;

import com.mahesh.LocalCab.booking.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

public class AdminDtos {

    @Data
    @Builder
    public static class DriverSummaryResponse {
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
        private Instant createdAt;
    }

    @Data
    @Builder
    public static class BookingSummaryResponse {
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

    @Data
    @Builder
    public static class AdminStatsResponse {
        private Long totalDrivers;
        private Long availableDrivers;
        private Long totalBookings;
        private Long completedBookings;
        private Long ongoingBookings;
    }
}

