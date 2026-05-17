package com.bodegon.club.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
@Slf4j
public class DatabaseConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource")
    public DataSourceProperties dataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    @ConfigurationProperties("spring.datasource.hikari")
    public HikariDataSource dataSource(DataSourceProperties properties) {
        String url = properties.getUrl();
        log.info("DatabaseConfig: initial datasource URL is: {}", url != null ? maskUrl(url) : "null");
        
        // Handle Render/Heroku style postgres(ql)://user:pass@host/db URLs, even if prefixed with jdbc:
        boolean isRenderUri = url != null && (
                url.startsWith("postgres://") || 
                url.startsWith("postgresql://") || 
                (url.startsWith("jdbc:postgresql://") && url.contains("@")) ||
                (url.startsWith("jdbc:postgres://") && url.contains("@"))
        );

        if (isRenderUri) {
            try {
                log.info("DatabaseConfig: parsing database URI from Render...");
                
                // Clean the prefix for URI parser
                String cleanUri = url.replaceFirst("^jdbc:postgresql://", "postgresql://")
                                     .replaceFirst("^jdbc:postgres://", "postgres://")
                                     .replaceFirst("^jdbc:", "");
                
                URI dbUri = new URI(cleanUri);

                String userInfo = dbUri.getUserInfo();
                String username = null;
                String password = null;
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    password = parts[1];
                } else if (userInfo != null) {
                    username = userInfo;
                }
                
                // Build a clean JDBC URL: jdbc:postgresql://host:port/database
                String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" + 
                               (dbUri.getPort() != -1 ? dbUri.getPort() : "5432") + 
                               dbUri.getPath();
                
                // Add SSL mode
                if (!dbUrl.contains("?")) {
                    dbUrl += "?sslmode=require";
                } else if (!dbUrl.contains("sslmode")) {
                    dbUrl += "&sslmode=require";
                }

                log.info("DatabaseConfig: successfully parsed URI. Host: {}, Database: {}, User: {}", 
                         dbUri.getHost(), dbUri.getPath(), username);
                
                properties.setUrl(dbUrl);
                if (username != null) properties.setUsername(username);
                if (password != null) properties.setPassword(password);
                
            } catch (Exception e) {
                log.error("DatabaseConfig: failed to parse database URI: {}. Falling back to default configuration.", e.getMessage(), e);
            }
        } else {
            log.info("DatabaseConfig: URL does not match Render URI pattern, skipping custom parsing.");
        }
        
        log.info("DatabaseConfig: initializing HikariDataSource with URL: {}", 
                 properties.getUrl() != null ? maskUrl(properties.getUrl()) : "null");
        
        return properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }

    private String maskUrl(String url) {
        // Simple masking of passwords in URLs for security logs
        return url.replaceAll("(?<=://)[^/]+(?=@)", "***");
    }
}
