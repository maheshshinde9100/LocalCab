package com.mahesh.LocalCab.auth;

import com.mahesh.LocalCab.admin.AdminUserRepository;
import com.mahesh.LocalCab.driver.DriverRepository;
import com.mahesh.LocalCab.rider.RiderRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final DriverRepository driverRepository;
    private final RiderRepository riderRepository;
    private final AdminUserRepository adminUserRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            final String username = jwtService.extractUsername(jwt);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null
                    && jwtService.isTokenValid(jwt, username)) {

                String role = jwtService.extractClaim(jwt, claims -> claims.get("role", String.class));

                if ("ADMIN".equals(role) && adminUserRepository.findByUsername(username).isPresent()) {
                    setAuthentication(request, username, "ROLE_ADMIN");
                } else if ("DRIVER".equals(role) && driverRepository.findByPhoneNumber(username).isPresent()) {
                    setAuthentication(request, username, "ROLE_DRIVER");
                } else if ("RIDER".equals(role) && riderRepository.findByPhoneNumber(username).isPresent()) {
                    setAuthentication(request, username, "ROLE_RIDER");
                }
            }
        } catch (Exception ex) {
            // Invalid token — let Spring Security handle authorization
        }

        filterChain.doFilter(request, response);
    }

    private void setAuthentication(HttpServletRequest request, String username, String authority) {
        var userDetails = User.withUsername(username)
                .password("")
                .authorities(authority)
                .build();

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }
}
