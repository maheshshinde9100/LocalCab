package com.mahesh.LocalCab.rating;

import com.mahesh.LocalCab.booking.Booking;
import com.mahesh.LocalCab.booking.BookingRepository;
import com.mahesh.LocalCab.booking.BookingStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static com.mahesh.LocalCab.rating.RatingDtos.*;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final BookingRepository bookingRepository;

    public RatingResponse createRating(CreateRatingRequest request) {
        // Verify booking exists and is completed
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new IllegalArgumentException("Can only rate completed bookings");
        }

        // Check if rating already exists for this booking
        ratingRepository.findByBookingId(request.getBookingId())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Rating already exists for this booking");
                });

        Rating rating = Rating.builder()
                .bookingId(request.getBookingId())
                .driverId(booking.getDriverId())
                .driverPhoneNumber(booking.getDriverPhoneNumber())
                .riderName(request.getRiderName())
                .riderPhoneNumber(request.getRiderPhoneNumber())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Rating saved = ratingRepository.save(rating);
        return toResponse(saved);
    }

    public List<RatingResponse> getRatingsForDriver(String driverId) {
        return ratingRepository.findByDriverIdOrderByCreatedAtDesc(driverId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public DriverRatingSummary getDriverRatingSummary(String driverId) {
        List<Rating> ratings = ratingRepository.findByDriverId(driverId);

        if (ratings.isEmpty()) {
            return DriverRatingSummary.builder()
                    .driverId(driverId)
                    .averageRating(0.0)
                    .totalRatings(0L)
                    .recentRatings(List.of())
                    .build();
        }

        double averageRating = ratings.stream()
                .mapToInt(Rating::getRating)
                .average()
                .orElse(0.0);

        List<RatingResponse> recentRatings = ratings.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(10)
                .map(this::toResponse)
                .collect(Collectors.toList());

        return DriverRatingSummary.builder()
                .driverId(driverId)
                .averageRating(Math.round(averageRating * 10.0) / 10.0) // Round to 1 decimal
                .totalRatings((long) ratings.size())
                .recentRatings(recentRatings)
                .build();
    }

    private RatingResponse toResponse(Rating rating) {
        return RatingResponse.builder()
                .id(rating.getId())
                .bookingId(rating.getBookingId())
                .driverId(rating.getDriverId())
                .driverPhoneNumber(rating.getDriverPhoneNumber())
                .riderName(rating.getRiderName())
                .riderPhoneNumber(rating.getRiderPhoneNumber())
                .rating(rating.getRating())
                .comment(rating.getComment())
                .createdAt(rating.getCreatedAt())
                .build();
    }
}

