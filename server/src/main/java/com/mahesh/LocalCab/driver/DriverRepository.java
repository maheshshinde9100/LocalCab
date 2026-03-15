package com.mahesh.LocalCab.driver;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface DriverRepository extends MongoRepository<Driver, String> {

    Optional<Driver> findByPhoneNumber(String phoneNumber);

    List<Driver> findByAvailableTrueAndPincode(String pincode);
    
    List<Driver> findByAvailableTrueAndVillageIgnoreCase(String village);

    long countByAvailableTrue();
}

