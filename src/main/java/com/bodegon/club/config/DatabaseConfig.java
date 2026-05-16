package com.bodegon.club.config;

import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;

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
        
        // Handle Render/Heroku style postgres:// URLs
        if (url != null && url.startsWith("postgres://")) {
            log.info("Detected postgres:// protocol, converting to jdbc:postgresql://");
            url = url.replace("postgres://", "jdbc:postgresql://");
            
            // Ensure sslmode is present for production
            if (!url.contains("sslmode")) {
                url += (url.contains("?") ? "&" : "?") + "sslmode=require";
            }
            properties.setUrl(url);
        }
        
        return properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }
}
