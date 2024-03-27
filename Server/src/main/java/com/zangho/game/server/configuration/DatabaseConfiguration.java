package com.zangho.game.server.configuration;

import com.zangho.game.server.repository.UserRepository;
import com.zangho.game.server.repository.VisitRepository;
import com.zangho.game.server.service.UserService;
import com.zangho.game.server.service.VisitService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfiguration {

    @Bean
    public UserService userService (UserRepository userRepository) {
        return new UserService(userRepository);
    }

    @Bean
    public VisitRepository visitRepository (DataSource visitDataSource) {
        return new VisitRepository(visitDataSource);
    }

    @Bean
    public VisitService visitService (VisitRepository visitRepository) {
        return new VisitService(visitRepository);
    }


}
