package com.zangho.chat.server.configuration;

import com.zangho.chat.server.service.ChatService;
import com.zangho.chat.server.service.LineNotifyService;
import com.zangho.chat.server.socketHandler.ChatSocketHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final LineNotifyService lineNotifyService;

    public WebSocketConfig (LineNotifyService lineNotifyService) {
        this.lineNotifyService = lineNotifyService;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatSocketHandler(), "/ws/chat").setAllowedOrigins("*");
    }

    @Bean
    public ChatSocketHandler chatSocketHandler() {
        return new ChatSocketHandler(chatService(), lineNotifyService);
    }

    @Bean
    public ChatService chatService() {
        return new ChatService();
    }
}
