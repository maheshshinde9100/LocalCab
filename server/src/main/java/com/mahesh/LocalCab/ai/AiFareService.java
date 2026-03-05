package com.mahesh.LocalCab.ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AiFareService {

    private static final double BASE_FARE = 50.0;
    private static final double PER_KM_RATE = 12.0;
    private static final int DEFAULT_KM = 10;

    @Value("${spring.ai.openai.api-key:}")
    private String openaiApiKey;

    private final ChatClient chatClient;

    public AiFareService(ChatModel chatModel) {
        this.chatClient = ChatClient.create(chatModel);
    }

    public FareSuggestionResponse suggestFare(FareSuggestionRequest request) {
        int km = Optional.ofNullable(request.getApproximateKm()).orElse(DEFAULT_KM);
        String vehicleType = Optional.ofNullable(request.getVehicleType()).orElse("Sedan");

        if (openaiApiKey != null && !openaiApiKey.isBlank()) {
            try {
                return suggestFareWithAi(request, km, vehicleType);
            } catch (Exception e) {
                // Fallback to heuristic
            }
        }
        return heuristicFare(km, vehicleType, request.getPickupVillage(), request.getDropLocation());
    }

    private FareSuggestionResponse suggestFareWithAi(FareSuggestionRequest request, int km, String vehicleType) {
        String prompt = String.format(
                "For a rural taxi in India: pickup=%s, drop=%s, vehicle=%s, approx %d km. " +
                        "Reply in exactly this format: MIN_FARE|MAX_FARE|TIP where numbers are in INR and TIP is one short sentence. Example: 200|350|Carry water for long trips.",
                request.getPickupVillage(), request.getDropLocation(), vehicleType, km);

        String content = this.chatClient.prompt()
                .user(prompt)
                .call()
                .content();

        if (content != null && !content.isBlank()) {
            String[] parts = content.trim().split("\\|");
            if (parts.length >= 3) {
                double min = Double.parseDouble(parts[0].replaceAll("[^0-9.]", ""));
                double max = Double.parseDouble(parts[1].replaceAll("[^0-9.]", ""));
                return FareSuggestionResponse.builder()
                        .suggestedMinFare(min)
                        .suggestedMaxFare(max)
                        .currency("INR")
                        .tip(parts[2].trim())
                        .fromAi(true)
                        .build();
            }
        }

        return heuristicFare(km, vehicleType, request.getPickupVillage(), request.getDropLocation());
    }

    private FareSuggestionResponse heuristicFare(int km, String vehicleType, String pickup, String drop) {
        double multiplier = vehicleType.equalsIgnoreCase("SUV") ? 1.2 : vehicleType.equalsIgnoreCase("Auto") ? 0.85 : 1.0;
        double raw = (BASE_FARE + km * PER_KM_RATE) * multiplier;
        double min = Math.round(raw * 0.9);
        double max = Math.round(raw * 1.15);
        return FareSuggestionResponse.builder()
                .suggestedMinFare(min)
                .suggestedMaxFare(max)
                .currency("INR")
                .tip("Rural fare estimate. Negotiate with the driver for final price.")
                .fromAi(false)
                .build();
    }
}
