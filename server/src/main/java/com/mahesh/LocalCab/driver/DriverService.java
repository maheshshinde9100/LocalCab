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
                .available(true)
                .build();

        Driver saved = driverRepository.save(driver);
        return toResponse(saved);
    }

    public List<DriverResponse> findAvailableDriversByPincode(String pincode) {
        return driverRepository.findByAvailableTrueAndPincode(pincode)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
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
                .build();
    }
}


