package com.finarg.core.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Slf4j
@Configuration
@Profile("prod")
public class SecurityConfigValidator {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    private static final String DEV_SECRET_MARKER = "dev-only";
    private static final int MIN_SECRET_LENGTH = 32;
    private static final int MIN_PASSWORD_LENGTH = 12;

    @PostConstruct
    public void validateProductionConfig() {
        validateJwtSecret();
        validateDatabasePassword();
        log.info("Production security configuration validated successfully");
    }

    private void validateJwtSecret() {
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            throw new IllegalStateException("JWT_SECRET environment variable must be set in production");
        }
        if (jwtSecret.contains(DEV_SECRET_MARKER)) {
            throw new IllegalStateException(
                    "JWT_SECRET contains development marker. Set a secure secret via JWT_SECRET env var");
        }
        if (jwtSecret.length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException(
                    "JWT_SECRET must be at least " + MIN_SECRET_LENGTH + " characters for security");
        }
    }

    private void validateDatabasePassword() {
        if (dbPassword == null || dbPassword.isEmpty()) {
            throw new IllegalStateException(
                    "DATABASE_PASSWORD environment variable must be set in production");
        }
        if (dbPassword.length() < MIN_PASSWORD_LENGTH) {
            log.warn("Database password is shorter than recommended {} characters", MIN_PASSWORD_LENGTH);
        }
        if (dbPassword.equals("finarg123")) {
            throw new IllegalStateException(
                    "Default database password detected. Set a secure password via DATABASE_PASSWORD env var");
        }
    }
}
