package com.mahesh.LocalCab.driver;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

import jakarta.persistence.EntityListeners;

@Entity
@Table(name = "drivers")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true, length = 20)
    private String phoneNumber;

    /**
     * For now we will store a hashed password here.
     * Later we can switch to OTP-based login if needed.
     */
    @Column(nullable = false)
    private String passwordHash;

    // Basic rural location details
    private String village;
    private String taluka;
    private String district;
    private String state;

    @Column(length = 10)
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
    @Column(updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}


