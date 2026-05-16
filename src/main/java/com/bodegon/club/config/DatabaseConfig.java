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
        
        // Handle Render/Heroku style postgres:// or postgresql:// URLs
        if (url != null && (url.startsWith("postgres://") || url.startsWith("postgresql://"))) {
            log.info("Detected postgres(ql):// protocol, converting to jdbc:postgresql://");
            
            // Regex to replace either postgres:// or postgresql:// with jdbc:postgresql://
            url = url.replaceFirst("^postgresql?://", "jdbc:postgresql://");
            
            // Ensure sslmode is present for production
            if (!url.contains("sslmode")) {
                url += (url.contains("?") ? "&" : "?") + "sslmode=require";
            }
            properties.setUrl(url);
        }
        
        log.info("Final JDBC URL: {}", properties.getUrl());
        
        return properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }
}
