package com.zangho.game.server.configuration;

import com.zangho.game.server.service.*;
import com.zangho.game.server.socketHandler.chat.ReqHandler;
import com.zangho.game.server.socketHandler.chat.ResHandler;
import com.zangho.game.server.socketHandler.chat.SocketHandler;
import com.zangho.game.server.socketHandler.chat.SessionHandler;
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
    private final LineNotifyService lineNotifyService;
    private final MessageService messageService;

    public WebSocketConfig (UserService userService, ChatRoomService chatRoomService, LineNotifyService lineNotifyService, MessageService messageService) {
        this.userService = userService;
        this.chatRoomService = chatRoomService;
        this.lineNotifyService = lineNotifyService;
        this.messageService = messageService;
    }

    @Bean
    public SessionHandler sessionHandler() {
        return new SessionHandler();
    }

    @Bean
    public ResHandler sendHandler() {
        return new ResHandler(sessionHandler(), userService);
    }

    @Bean
    public ReqHandler receiveHandler() {
        return new ReqHandler(sessionHandler(), sendHandler(), userService, chatRoomService, lineNotifyService, messageService);
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatSocketHandler(), "/ws/game").setAllowedOrigins("*");
    }

    @Bean
    public SocketHandler chatSocketHandler() {
        return new SocketHandler(sessionHandler(), receiveHandler(), userService);
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
