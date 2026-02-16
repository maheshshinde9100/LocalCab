package com.mahesh.LocalCab.rating;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

public class RatingDtos {

    @Data
    public static class CreateRatingRequest {
        @NotBlank
        private String bookingId;

        @NotBlank
        private String riderName;

        @NotBlank
        private String riderPhoneNumber;

        @NotNull
        @Min(1)
        @Max(5)
        private Integer rating;

        private String comment;
    }

    @Data
    @Builder
    public static class RatingResponse {
        private String id;
        private String bookingId;
        private String driverId;
        private String driverPhoneNumber;
        private String riderName;
        private String riderPhoneNumber;
        private Integer rating;
        private String comment;
        private Instant createdAt;
    }

    @Data
    @Builder
    public static class DriverRatingSummary {
        private String driverId;
        private Double averageRating;
        private Long totalRatings;
        private List<RatingResponse> recentRatings;
    }
}

