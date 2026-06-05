package com.mahesh.LocalCab.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    private String id;

    // Link to driver
    private String driverId;
    private String driverPhoneNumber;

    // Link to rider
    private String riderId;
    private String riderName;
    private String riderPhoneNumber;

    // Trip details
    private String pickupVillage;
    private String pickupLandmark;
    private String dropLocation;

    // GPS coordinates
    private Double pickupLatitude;
    private Double pickupLongitude;
    private Double dropLatitude;
    private Double dropLongitude;

    // Fare & distance
    private Double agreedFare;
    private Double distanceKm;

    // Timestamps for each status
    private Instant requestedAt;
    private Instant confirmedAt;
    private Instant ongoingAt;
    private Instant completedAt;
    private Instant cancelledAt;

    // Cancellation details
    private String cancellationReason;
    private String cancelledBy;

    // Payment details
    private String paymentStatus; // PENDING, COMPLETED, FAILED
    private String paymentMethod; // RAZORPAY, CASH, NONE
    private String razorpayOrderId;
    private String razorpayPaymentId;

    // Current driver location (for tracking)
    private Double driverLatitude;
    private Double driverLongitude;

    private BookingStatus status;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}


