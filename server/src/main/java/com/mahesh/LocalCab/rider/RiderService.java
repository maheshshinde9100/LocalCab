package com.mahesh.LocalCab.rider;

import com.mahesh.LocalCab.auth.JwtService;
import com.mahesh.LocalCab.config.ConflictException;
import com.mahesh.LocalCab.config.ResourceNotFoundException;
import com.mahesh.LocalCab.config.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RiderService {

    private final RiderRepository riderRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public RiderDtos.AuthResponse register(RiderDtos.RegisterRequest request) {
        if (riderRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new ConflictException("Phone number already registered");
        }

        Rider rider = Rider.builder()
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .village(request.getVillage())
                .taluka(request.getTaluka())
                .district(request.getDistrict())
                .state(request.getState())
                .pincode(request.getPincode())
                .build();

        rider = riderRepository.save(rider);
        String token = jwtService.generateToken(rider.getPhoneNumber(), "RIDER");

        return RiderDtos.AuthResponse.builder()
                .token(token)
                .rider(toRiderResponse(rider))
                .build();
    }

    public RiderDtos.AuthResponse login(RiderDtos.LoginRequest request) {
        Rider rider = riderRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), rider.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        String token = jwtService.generateToken(rider.getPhoneNumber(), "RIDER");

        return RiderDtos.AuthResponse.builder()
                .token(token)
                .rider(toRiderResponse(rider))
                .build();
    }

    public RiderDtos.RiderResponse getCurrentRiderProfile() {
        return toRiderResponse(getCurrentRider());
    }

    @Cacheable(value = "riderProfile", key = "#riderId")
    public RiderDtos.RiderResponse getRiderProfile(String riderId) {
        Rider rider = riderRepository.findById(riderId)
                .orElseThrow(() -> new ResourceNotFoundException("Rider not found"));
        return toRiderResponse(rider);
    }

    public RiderDtos.RiderResponse updateLocation(String riderId, RiderDtos.UpdateLocationRequest request) {
        Rider rider = riderRepository.findById(riderId)
                .orElseThrow(() -> new ResourceNotFoundException("Rider not found"));
        rider.setLatitude(request.getLatitude());
        rider.setLongitude(request.getLongitude());
        rider = riderRepository.save(rider);
        return toRiderResponse(rider);
    }

    private Rider getCurrentRider() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new SecurityException("Rider not authenticated");
        }
        return riderRepository.findByPhoneNumber(authentication.getName())
                .orElseThrow(() -> new SecurityException("Rider not found"));
    }

    private RiderDtos.RiderResponse toRiderResponse(Rider rider) {
        return RiderDtos.RiderResponse.builder()
                .id(rider.getId())
                .fullName(rider.getFullName())
                .phoneNumber(rider.getPhoneNumber())
                .email(rider.getEmail())
                .village(rider.getVillage())
                .taluka(rider.getTaluka())
                .district(rider.getDistrict())
                .state(rider.getState())
                .pincode(rider.getPincode())
                .latitude(rider.getLatitude())
                .longitude(rider.getLongitude())
                .build();
    }
}
