package com.zangho.game.server.configuration;

import com.zangho.game.server.service.ChatService;
import com.zangho.game.server.service.LineNotifyService;
import com.zangho.game.server.socketHandler.GameSocketHandler;
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
        registry.addHandler(chatSocketHandler(), "/ws/game").setAllowedOrigins("*");
    }

    @Bean
    public GameSocketHandler chatSocketHandler() {
        return new GameSocketHandler(chatService(), lineNotifyService);
    }

    @Bean
    public ChatService chatService() {
        return new ChatService();
    }
}