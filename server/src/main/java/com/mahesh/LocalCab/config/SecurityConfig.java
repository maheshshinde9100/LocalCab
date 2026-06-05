package com.mahesh.LocalCab.config;

import com.mahesh.LocalCab.auth.JwtAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.time.Instant;
import java.util.Map;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    // TODO: Re-enable rate limiting for production — inject RateLimitFilter and register the filter below
    // private final RateLimitFilter rateLimitFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public auth & registration
                        .requestMatchers("/api/drivers/register").permitAll()
                        .requestMatchers("/api/drivers/available").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/riders/register").permitAll()
                        .requestMatchers("/api/riders/login").permitAll()
                        // Public booking read/create for guest riders
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/bookings").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/bookings/config").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/bookings/*/stream").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/bookings/*").permitAll()
                        // AI fare suggestion
                        .requestMatchers("/api/ai/**").permitAll()
                        // Ratings (public submission)
                        .requestMatchers("/api/ratings/**").permitAll()
                        // Driver-only endpoints
                        .requestMatchers("/api/drivers/me").hasAuthority("ROLE_DRIVER")
                        .requestMatchers("/api/bookings/me").hasAuthority("ROLE_DRIVER")
                        .requestMatchers(org.springframework.http.HttpMethod.PATCH, "/api/bookings/*/status").hasAuthority("ROLE_DRIVER")
                        .requestMatchers(org.springframework.http.HttpMethod.PATCH, "/api/bookings/*/location").hasAuthority("ROLE_DRIVER")
                        // Rider-only endpoints
                        .requestMatchers("/api/riders/me").hasAuthority("ROLE_RIDER")
                        .requestMatchers("/api/bookings/rider/me").hasAuthority("ROLE_RIDER")
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/bookings/rider/*").hasAnyAuthority("ROLE_RIDER", "ROLE_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.PATCH, "/api/bookings/*/cancel/*").hasAnyAuthority("ROLE_RIDER", "ROLE_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/bookings/*/razorpay-order").hasAnyAuthority("ROLE_RIDER", "ROLE_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/bookings/*/razorpay-verify").hasAnyAuthority("ROLE_RIDER", "ROLE_ADMIN")
                        .requestMatchers("/api/riders/profile/**").hasAnyAuthority("ROLE_RIDER", "ROLE_ADMIN")
                        // Driver profile endpoints
                        .requestMatchers("/api/drivers/*").authenticated()
                        // Admin endpoints
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(this::handleUnauthorized)
                        .accessDeniedHandler(this::handleForbidden)
                )
                .httpBasic(httpBasic -> httpBasic.disable())
                .formLogin(form -> form.disable())
                // .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private void handleUnauthorized(HttpServletRequest request, HttpServletResponse response,
                                    org.springframework.security.core.AuthenticationException authException)
            throws java.io.IOException {
        writeJsonError(response, HttpStatus.UNAUTHORIZED, "Unauthorized", "Authentication required", request.getRequestURI());
    }

    private void handleForbidden(HttpServletRequest request, HttpServletResponse response,
                                 org.springframework.security.access.AccessDeniedException accessDeniedException)
            throws java.io.IOException {
        writeJsonError(response, HttpStatus.FORBIDDEN, "Forbidden", "Access denied", request.getRequestURI());
    }

    private void writeJsonError(HttpServletResponse response, HttpStatus status, String error,
                                String message, String path) throws java.io.IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        Map<String, Object> body = Map.of(
                "timestamp", Instant.now().toString(),
                "status", status.value(),
                "error", error,
                "message", message,
                "path", path
        );
        new ObjectMapper().writeValue(response.getOutputStream(), body);
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(java.util.List.of(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:5173"
        ));
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(java.util.List.of("Authorization"));
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
