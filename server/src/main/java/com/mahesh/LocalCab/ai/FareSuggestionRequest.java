package com.mahesh.LocalCab.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FareSuggestionRequest {
    @NotBlank
    private String pickupVillage;
    @NotBlank
    private String dropLocation;
    private String vehicleType;
    private Integer approximateKm;
}
