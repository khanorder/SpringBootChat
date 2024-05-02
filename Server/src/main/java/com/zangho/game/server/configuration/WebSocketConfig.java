package com.zangho.game.server.configuration;

import com.zangho.game.server.service.*;
import com.zangho.game.server.socketHandler.chat.ReqHandler;
import com.zangho.game.server.socketHandler.chat.ResHandler;
import com.zangho.game.server.socketHandler.chat.SocketHandler;
import com.zangho.game.server.socketHandler.chat.SessionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final NotificationService notificationService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public WebSocketConfig (UserService userService, ChatRoomService chatRoomService, LineNotifyService lineNotifyService, MessageService messageService, NotificationService notificationService, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.chatRoomService = chatRoomService;
        this.lineNotifyService = lineNotifyService;
        this.messageService = messageService;
        this.notificationService = notificationService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public SessionHandler sessionHandler() {
        return new SessionHandler(userService);
    }

    @Bean
    public ResHandler resHandler() {
        return new ResHandler(sessionHandler(), userService, notificationService, jwtService, messageService);
    }

    @Bean
    public ReqHandler reqHandler() {
        return new ReqHandler(sessionHandler(), resHandler(), userService, chatRoomService, lineNotifyService, messageService, notificationService, jwtService, passwordEncoder);
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(chatSocketHandler(), "/ws/game").setAllowedOrigins("*");
    }

    @Bean
    public SocketHandler chatSocketHandler() {
        return new SocketHandler(sessionHandler(), reqHandler(), userService);
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
