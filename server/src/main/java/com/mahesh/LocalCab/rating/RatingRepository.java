package com.mahesh.LocalCab.rating;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends MongoRepository<Rating, String> {

    Optional<Rating> findByBookingId(String bookingId);

    List<Rating> findByDriverIdOrderByCreatedAtDesc(String driverId);

    List<Rating> findByDriverId(String driverId);
}

