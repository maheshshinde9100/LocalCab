package com.mahesh.LocalCab.config;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
public class GeocodingService {

    private static final String USER_AGENT = "LocalCab/1.0 (local-cab-app)";
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Resolve a village/city name to [latitude, longitude] using OpenStreetMap Nominatim.
     */
    public double[] geocode(String placeName) {
        if (placeName == null || placeName.isBlank()) {
            return null;
        }
        try {
            String query = URLEncoder.encode(placeName.trim() + ", India", StandardCharsets.UTF_8);
            String url = "https://nominatim.openstreetmap.org/search?q=" + query + "&format=json&limit=1";

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", USER_AGENT);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, entity, List.class);
            List<?> body = response.getBody();
            if (body == null || body.isEmpty()) {
                return null;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> result = (Map<String, Object>) body.get(0);
            double lat = Double.parseDouble(result.get("lat").toString());
            double lon = Double.parseDouble(result.get("lon").toString());
            return new double[]{lat, lon};
        } catch (Exception e) {
            return null;
        }
    }
}
