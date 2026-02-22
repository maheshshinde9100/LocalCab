package com.mahesh.LocalCab.rating;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "ratings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rating {

    @Id
    private String id;

    private String bookingId;
    private String driverId;
    private String driverPhoneNumber;

    // Rider info (who gave the rating)
    private String riderName;
    private String riderPhoneNumber;

    // Rating details
    private Integer rating; // 1-5 stars
    private String comment; // optional review text

    @CreatedDate
    private Instant createdAt;
}

