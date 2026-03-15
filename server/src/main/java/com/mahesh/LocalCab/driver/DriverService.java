package com.mahesh.LocalCab.driver;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static com.mahesh.LocalCab.driver.DriverDtos.DriverResponse;
import static com.mahesh.LocalCab.driver.DriverDtos.RegisterDriverRequest;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public DriverResponse registerDriver(RegisterDriverRequest request) {
        driverRepository.findByPhoneNumber(request.getPhoneNumber())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Driver already registered with this phone number");
                });

        Driver driver = Driver.builder()
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .village(request.getVillage())
                .taluka(request.getTaluka())
                .district(request.getDistrict())
                .state(request.getState())
                .pincode(request.getPincode())
                .vehicleType(request.getVehicleType())
                .vehicleModel(request.getVehicleModel())
                .vehicleNumber(request.getVehicleNumber())
                .totalSeats(request.getTotalSeats())
                .available(false)
                .verified(false)
                .build();

        Driver saved = driverRepository.save(driver);
        return toResponse(saved);
    }

    public List<DriverResponse> findAvailableDriversByLocation(String query) {
        if (query == null || query.isBlank()) return List.of();
        
        // If query is a 6-digit numeric string, search by pincode
        if (query.matches("\\d{6}")) {
            return driverRepository.findByAvailableTrueAndVerifiedTrueAndPincode(query)
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
        
        // Otherwise search by village name
        return driverRepository.findByAvailableTrueAndVerifiedTrueAndVillageIgnoreCase(query)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<DriverResponse> findAvailableDriversByPincode(String pincode) {
        return findAvailableDriversByLocation(pincode);
    }

    public void updateAvailability(String driverId, boolean available) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
        driver.setAvailable(available);
        driverRepository.save(driver);
    }

    public DriverResponse updateProfile(String driverId, DriverDtos.RegisterDriverRequest update) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        driver.setFullName(update.getFullName());
        driver.setVillage(update.getVillage());
        driver.setTaluka(update.getTaluka());
        driver.setDistrict(update.getDistrict());
        driver.setState(update.getState());
        driver.setPincode(update.getPincode());
        driver.setVehicleType(update.getVehicleType());
        driver.setVehicleModel(update.getVehicleModel());
        driver.setVehicleNumber(update.getVehicleNumber());
        driver.setTotalSeats(update.getTotalSeats());

        Driver saved = driverRepository.save(driver);
        return toResponse(saved);
    }

    private DriverResponse toResponse(Driver driver) {
        return DriverResponse.builder()
                .id(driver.getId())
                .fullName(driver.getFullName())
                .phoneNumber(driver.getPhoneNumber())
                .village(driver.getVillage())
                .taluka(driver.getTaluka())
                .district(driver.getDistrict())
                .state(driver.getState())
                .pincode(driver.getPincode())
                .vehicleType(driver.getVehicleType())
                .vehicleModel(driver.getVehicleModel())
                .vehicleNumber(driver.getVehicleNumber())
                .totalSeats(driver.getTotalSeats())
                .available(driver.isAvailable())
                .verified(driver.isVerified())
                .build();
    }
}


