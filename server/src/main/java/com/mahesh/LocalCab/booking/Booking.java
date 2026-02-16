package com.mahesh.LocalCab.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
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

    // Rider information (we keep this simple; no separate user account yet)
    private String riderName;
    private String riderPhoneNumber;

    // Trip details (after phone negotiation)
    private String pickupVillage;
    private String pickupLandmark;
    private String dropLocation;
    private Double agreedFare; // total agreed fare in local currency

    private BookingStatus status;

    @CreatedDate
    private Instant createdAt;
}


