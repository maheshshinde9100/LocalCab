package com.mahesh.LocalCab.rider;

import com.mahesh.LocalCab.auth.JwtService;
import lombok.RequiredArgsConstructor;
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
            throw new RuntimeException("Phone number already registered");
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
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), rider.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(rider.getPhoneNumber(), "RIDER");

        return RiderDtos.AuthResponse.builder()
                .token(token)
                .rider(toRiderResponse(rider))
                .build();
    }

    public RiderDtos.RiderResponse getRiderProfile(String riderId) {
        Rider rider = riderRepository.findById(riderId)
                .orElseThrow(() -> new RuntimeException("Rider not found"));
        return toRiderResponse(rider);
    }

    public RiderDtos.RiderResponse updateLocation(String riderId, RiderDtos.UpdateLocationRequest request) {
        Rider rider = riderRepository.findById(riderId)
                .orElseThrow(() -> new RuntimeException("Rider not found"));
        rider.setLatitude(request.getLatitude());
        rider.setLongitude(request.getLongitude());
        rider = riderRepository.save(rider);
        return toRiderResponse(rider);
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
