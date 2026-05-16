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
        
        // Handle Render/Heroku style postgres(ql)://user:pass@host/db URLs
        if (url != null && (url.startsWith("postgres://") || url.startsWith("postgresql://"))) {
            try {
                log.info("Parsing database URI from Render...");
                
                // Clean the prefix for URI parser
                String cleanUri = url.replaceFirst("^jdbc:", ""); 
                URI dbUri = new URI(cleanUri);

                String username = dbUri.getUserInfo().split(":")[0];
                String password = dbUri.getUserInfo().split(":")[1];
                
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

                log.info("Extracted Host: {}, Database: {}, User: {}", dbUri.getHost(), dbUri.getPath(), username);
                
                properties.setUrl(dbUrl);
                properties.setUsername(username);
                properties.setPassword(password);
                
            } catch (URISyntaxException | ArrayIndexOutOfBoundsException e) {
                log.error("Failed to parse database URI: {}. Falling back to default configuration.", e.getMessage());
            }
        }
        
        return properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }
}
