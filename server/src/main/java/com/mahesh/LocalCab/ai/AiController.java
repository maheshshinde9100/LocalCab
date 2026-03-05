package com.mahesh.LocalCab.ai;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiController {

    private final AiFareService aiFareService;

    @PostMapping("/suggest-fare")
    public ResponseEntity<FareSuggestionResponse> getFareSuggestion(@Valid @RequestBody FareSuggestionRequest request) {
        return ResponseEntity.ok(aiFareService.suggestFare(request));
    }
}
