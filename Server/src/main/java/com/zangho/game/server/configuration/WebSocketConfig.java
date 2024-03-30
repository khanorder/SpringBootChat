package com.zangho.game.server.configuration;

import com.zangho.game.server.service.*;
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

    private final UserService userService;
    private final ChatRoomService chatRoomService;
    private final ChatService chatService;
    private final ChatImageService chatImageService;
    private final LineNotifyService lineNotifyService;
    private final MessageService messageService;

    public WebSocketConfig (UserService userService, ChatRoomService chatRoomService, ChatService chatService, ChatImageService chatImageService, LineNotifyService lineNotifyService, MessageService messageService) {
        this.userService = userService;
        this.chatRoomService = chatRoomService;
        this.chatService = chatService;
        this.chatImageService = chatImageService;
        this.lineNotifyService = lineNotifyService;
        this.messageService = messageService;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatSocketHandler(), "/ws/game").setAllowedOrigins("*");
    }

    @Bean
    public GameSocketHandler chatSocketHandler() {
        return new GameSocketHandler(userService, chatService, chatImageService, chatRoomService, lineNotifyService, messageService);
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
