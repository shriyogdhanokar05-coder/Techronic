package com.yourorg.appname.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * Smart Database Configuration for Render Cloud Deployment.
 * Detects Render's DATABASE_URL environment variable (postgres:// or postgresql://),
 * extracts credentials, converts it to standard JDBC format (jdbc:postgresql://...),
 * and configures the primary HikariCP DataSource.
 */
@Slf4j
@Configuration
@Profile("postgres")
public class DatabaseConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Value("${spring.datasource.url:}")
    private String fallbackUrl;

    @Value("${spring.datasource.username:}")
    private String fallbackUsername;

    @Value("${spring.datasource.password:}")
    private String fallbackPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");

        if (databaseUrl != null && !databaseUrl.trim().isEmpty()) {
            log.info("Detected Render DATABASE_URL environment variable. Parsing connection string...");
            parseAndApplyDatabaseUrl(databaseUrl.trim(), config);
        } else if (fallbackUrl != null && !fallbackUrl.trim().isEmpty()) {
            log.info("Using standard spring.datasource.url: {}", fallbackUrl);
            config.setJdbcUrl(fallbackUrl);
            config.setUsername(fallbackUsername);
            config.setPassword(fallbackPassword);
        } else {
            log.warn("No DATABASE_URL or spring.datasource.url found. Falling back to localhost:5432/techronics_db");
            config.setJdbcUrl("jdbc:postgresql://localhost:5432/techronics_db");
            config.setUsername("postgres");
            config.setPassword("postgres");
        }

        // Production-tuned connection pool settings
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(20000);
        config.setMaxLifetime(1200000);

        return new HikariDataSource(config);
    }

    private void parseAndApplyDatabaseUrl(String rawUrl, HikariConfig config) {
        try {
            // Already standard JDBC URL
            if (rawUrl.startsWith("jdbc:")) {
                config.setJdbcUrl(rawUrl);
                return;
            }

            // Standardize URI scheme (convert postgres:// to postgresql:// for URI parsing)
            String normalizedUrl = rawUrl;
            if (normalizedUrl.startsWith("postgres://")) {
                normalizedUrl = "postgresql://" + normalizedUrl.substring("postgres://".length());
            }

            URI uri = new URI(normalizedUrl);
            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String path = uri.getPath(); // e.g., /techronics_db
            String query = uri.getQuery();

            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + (path != null ? path : "");
            if (query != null && !query.trim().isEmpty()) {
                jdbcUrl += "?" + query.trim();
            }

            config.setJdbcUrl(jdbcUrl);

            // Extract credentials from userinfo (e.g. user:password)
            String userInfo = uri.getUserInfo();
            if (userInfo != null && !userInfo.isEmpty()) {
                String[] credentials = userInfo.split(":", 2);
                config.setUsername(credentials[0]);
                if (credentials.length > 1) {
                    config.setPassword(credentials[1]);
                }
            }

            log.info("Successfully converted Render DATABASE_URL to standard JDBC: {}", jdbcUrl);
        } catch (URISyntaxException e) {
            log.error("Failed to parse DATABASE_URL as URI: {}. Using raw URL directly.", e.getMessage());
            config.setJdbcUrl(rawUrl);
        }
    }
}
