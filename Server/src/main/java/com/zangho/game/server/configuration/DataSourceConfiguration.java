package com.zangho.game.server.configuration;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfiguration {

    @Bean(name = "visitDataSource")
    @ConfigurationProperties(prefix = "rds.visit.datasource")
    public DataSource visitDataSource() {
        return DataSourceBuilder.create().type(HikariDataSource.class).build();
    }
}
