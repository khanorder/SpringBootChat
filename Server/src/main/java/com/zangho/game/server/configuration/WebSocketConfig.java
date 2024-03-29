package com.zangho.game.server.configuration;

import com.zangho.game.server.domain.User;
import com.zangho.game.server.service.ChatService;
import com.zangho.game.server.service.LineNotifyService;
import com.zangho.game.server.service.MessageService;
import com.zangho.game.server.service.UserService;
import com.zangho.game.server.socketHandler.GameSocketHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChatService chatService;
    private final UserService userService;
    private final LineNotifyService lineNotifyService;
    private final MessageService messageService;

    public WebSocketConfig (ChatService chatService, UserService userService, LineNotifyService lineNotifyService, MessageService messageService) {
        this.chatService = chatService;
        this.userService = userService;
        this.lineNotifyService = lineNotifyService;
        this.messageService = messageService;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatSocketHandler(), "/ws/game").setAllowedOrigins("*");
    }

    @Bean
    public GameSocketHandler chatSocketHandler() {
        return new GameSocketHandler(userService, chatService, lineNotifyService, messageService);
    }

    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        var container = new ServletServerContainerFactoryBean();
        // 버퍼사이즈를 20MB로 제한
        container.setMaxTextMessageBufferSize(20971520);
        container.setMaxBinaryMessageBufferSize(20971520);
        return container;
    }
}
