package com.mahesh.LocalCab.booking;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByDriverIdOrderByCreatedAtDesc(String driverId);

    List<Booking> findByRiderIdOrderByCreatedAtDesc(String riderId);

    long countByStatus(BookingStatus status);

    long countByRiderId(String riderId);
}


