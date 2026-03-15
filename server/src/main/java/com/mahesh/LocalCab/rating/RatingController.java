package com.mahesh.LocalCab.rating;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.mahesh.LocalCab.rating.RatingDtos.*;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RatingController {

    private final RatingService ratingService;

    /**
     * Public endpoint: create a rating for a completed booking.
     */
    @PostMapping
    public ResponseEntity<RatingResponse> createRating(@Valid @RequestBody CreateRatingRequest request) {
        RatingResponse response = ratingService.createRating(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Public endpoint: get all ratings for a specific driver.
     */
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<RatingResponse>> getRatingsForDriver(@PathVariable("driverId") String driverId) {
        List<RatingResponse> ratings = ratingService.getRatingsForDriver(driverId);
        return ResponseEntity.ok(ratings);
    }

    /**
     * Public endpoint: get rating summary (average, total count, recent reviews) for a driver.
     */
    @GetMapping("/driver/{driverId}/summary")
    public ResponseEntity<DriverRatingSummary> getDriverRatingSummary(@PathVariable("driverId") String driverId) {
        DriverRatingSummary summary = ratingService.getDriverRatingSummary(driverId);
        return ResponseEntity.ok(summary);
    }
}

