package com.mahesh.LocalCab.driver;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import static com.mahesh.LocalCab.driver.DriverDtos.DriverResponse;
import static com.mahesh.LocalCab.driver.DriverDtos.RegisterDriverRequest;
import static com.mahesh.LocalCab.driver.DriverDtos.UpdateDriverProfileRequest;

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

    @Cacheable(value = "availableDrivers", key = "#query")
    public List<DriverResponse> findAvailableDriversByLocation(String query) {
        if (query == null || query.isBlank() || "all".equalsIgnoreCase(query.trim())) {
            return driverRepository.findByAvailableTrueAndVerifiedTrue()
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }

        if (query.matches("\\d{6}")) {
            return driverRepository.findByAvailableTrueAndVerifiedTrueAndPincode(query)
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }

        return driverRepository.findByAvailableTrueAndVerifiedTrueAndVillageIgnoreCase(query)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public DriverResponse getCurrentDriverProfile() {
        return toResponse(getCurrentDriver());
    }

    @CacheEvict(value = {"driverProfile", "availableDrivers"}, allEntries = true)
    public void updateAvailability(String driverId, boolean available) {
        Driver driver = getOwnedDriver(driverId);
        if (!driver.isVerified()) {
            throw new SecurityException("Account pending admin verification");
        }
        driver.setAvailable(available);
        driverRepository.save(driver);
    }

    @CacheEvict(value = {"driverProfile", "availableDrivers"}, allEntries = true)
    public DriverResponse updateProfile(String driverId, UpdateDriverProfileRequest update) {
        Driver driver = getOwnedDriver(driverId);

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

    @CacheEvict(value = {"driverProfile", "availableDrivers"}, allEntries = true)
    public DriverResponse updateLocation(String driverId, DriverDtos.UpdateLocationRequest request) {
        Driver driver = getOwnedDriver(driverId);
        driver.setLatitude(request.getLatitude());
        driver.setLongitude(request.getLongitude());
        Driver saved = driverRepository.save(driver);
        return toResponse(saved);
    }

    @Cacheable(value = "driverProfile", key = "#driverId")
    public DriverResponse getDriverById(String driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
        return toResponse(driver);
    }

    private Driver getOwnedDriver(String driverId) {
        Driver current = getCurrentDriver();
        if (!current.getId().equals(driverId)) {
            throw new SecurityException("You can only modify your own profile");
        }
        return current;
    }

    private Driver getCurrentDriver() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new SecurityException("Driver not authenticated");
        }
        return driverRepository.findByPhoneNumber(authentication.getName())
                .orElseThrow(() -> new SecurityException("Driver not found"));
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
                .latitude(driver.getLatitude())
                .longitude(driver.getLongitude())
                .vehicleType(driver.getVehicleType())
                .vehicleModel(driver.getVehicleModel())
                .vehicleNumber(driver.getVehicleNumber())
                .totalSeats(driver.getTotalSeats())
                .available(driver.isAvailable())
                .verified(driver.isVerified())
                .build();
    }
}
