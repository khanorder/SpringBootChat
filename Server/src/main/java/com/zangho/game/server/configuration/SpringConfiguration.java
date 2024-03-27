package com.zangho.game.server.configuration;

import com.zangho.game.server.service.ChatService;
import com.zangho.game.server.service.MessageService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringConfiguration {

    @Bean
    public MessageService messageService() {
        return new MessageService(chatService());
    }

    @Bean
    public ChatService chatService() {
        return new ChatService();
    }

}
