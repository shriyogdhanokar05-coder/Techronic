package com.yourorg.appname.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins:${CORS_ALLOWED_ORIGINS:}}")
    private String customAllowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> allowedPatterns = new ArrayList<>();
        // Allow localhost and local development ports
        allowedPatterns.add("http://localhost:[*]");
        allowedPatterns.add("http://127.0.0.1:[*]");
        allowedPatterns.add("http://localhost:5173");
        allowedPatterns.add("http://localhost:3000");

        // Allow any Render-hosted deployment domain
        allowedPatterns.add("https://*.onrender.com");
        allowedPatterns.add("http://*.onrender.com");

        // Support custom domains via CORS_ALLOWED_ORIGINS environment variable
        if (customAllowedOrigins != null && !customAllowedOrigins.trim().isEmpty()) {
            String[] origins = customAllowedOrigins.split(",");
            for (String origin : origins) {
                String trimmed = origin.trim();
                if (!trimmed.isEmpty()) {
                    allowedPatterns.add(trimmed);
                }
            }
        }

        configuration.setAllowedOriginPatterns(allowedPatterns);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        configuration.setExposedHeaders(Collections.singletonList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
