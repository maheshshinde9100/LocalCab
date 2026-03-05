package com.mahesh.LocalCab.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FareSuggestionResponse {
    private Double suggestedMinFare;
    private Double suggestedMaxFare;
    private String currency;
    private String tip;  // AI-generated tip for the trip
    private boolean fromAi;
}
