package com.mahesh.LocalCab.driver;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, Long> {

    Optional<Driver> findByPhoneNumber(String phoneNumber);

    List<Driver> findByAvailableTrueAndPincode(String pincode);
}


