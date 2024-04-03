package com.zangho.game.server.configuration;

import com.zangho.game.server.repository.chat.ChatImageRepository;
import com.zangho.game.server.repository.visit.VisitRepository;
import com.zangho.game.server.service.ChatImageService;
import com.zangho.game.server.service.VisitService;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfiguration {

    @Bean
    public ChatImageService chatImageService (ChatImageRepository chatImageRepository) {
        return new ChatImageService(chatImageRepository);
    }

    @Bean
    public VisitRepository visitRepository (DataSource visitDataSource) {
        return new VisitRepository(visitDataSource);
    }

    @Bean
    public VisitService visitService (VisitRepository visitRepository) {
        return new VisitService(visitRepository);
    }

    @Bean(name = "visitDataSource")
    @ConfigurationProperties(prefix = "rds.visit.datasource")
    public DataSource visitDataSource() {
        return DataSourceBuilder.create().type(HikariDataSource.class).build();
    }
}
