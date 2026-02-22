package com.mahesh.LocalCab.driver;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "drivers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Driver {

    @Id
    private String id;

    private String fullName;

    /**
     * Unique phone number (we enforce this via queries, and you can add a unique index in Mongo).
     */
    private String phoneNumber;

    /**
     * Hashed password (BCrypt). Later we can move to OTP-based login if preferred.
     */
    private String passwordHash;

    // Basic rural location details
    private String village;
    private String taluka;
    private String district;
    private String state;

    private String pincode;

    // Optional GPS coordinates if available
    private Double latitude;
    private Double longitude;

    // Vehicle details
    private String vehicleType;   // e.g. Hatchback, Sedan, SUV, Auto
    private String vehicleModel;  // e.g. Swift, Bolero
    private String vehicleNumber;
    private Integer totalSeats;

    private boolean available;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
