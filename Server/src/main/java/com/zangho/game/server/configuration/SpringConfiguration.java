package com.zangho.game.server.configuration;

import com.zangho.game.server.repository.chat.ChatImageRepository;
import com.zangho.game.server.repository.chat.ChatRepository;
import com.zangho.game.server.repository.chat.ChatRoomRepository;
import com.zangho.game.server.repository.chat.UserRoomRepository;
import com.zangho.game.server.repository.user.*;
import com.zangho.game.server.service.*;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.filter.ShallowEtagHeaderFilter;

import java.io.IOException;

@Configuration
public class SpringConfiguration {

    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatRepository chatRepository;
    private final ChatImageRepository chatImageRepository;
    private final UserRoomRepository userRoomRepository;
    private final RelationRepository relationRepository;
    private final NotificationRepository notificationRepository;
    private final DisposedTokenRepository disposedTokenRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;

    public SpringConfiguration(
        UserRepository userRepository,
        ChatRoomRepository chatRoomRepository,
        ChatRepository chatRepository,
        ChatImageRepository chatImageRepository,
        UserRoomRepository userRoomRepository,
        RelationRepository relationRepository,
        NotificationRepository notificationRepository,
        DisposedTokenRepository disposedTokenRepository,
        UserSubscriptionRepository userSubscriptionRepository
    ) {
        this.userRepository = userRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.chatRepository = chatRepository;
        this.chatImageRepository = chatImageRepository;
        this.userRoomRepository = userRoomRepository;
        this.relationRepository = relationRepository;
        this.notificationRepository = notificationRepository;
        this.disposedTokenRepository = disposedTokenRepository;
        this.userSubscriptionRepository = userSubscriptionRepository;
    }

    @Bean
    public JwtService jwtService() {
        return new JwtService(disposedTokenRepository);
    }

    @Bean
    public UserService userService() {
        return new UserService(userRepository, chatRoomRepository, userRoomRepository, relationRepository, userSubscriptionRepository);
    }

    @Bean
    public ChatRoomService chatRoomService() {
        return new ChatRoomService(chatRoomRepository, chatRepository, userRoomRepository, userService());
    }

    @Bean
    public ChatService chatService() {
        return new ChatService(chatRepository);
    }

    @Bean
    public ChatImageService chatImageService () {
        return new ChatImageService(chatImageRepository);
    }

    @Bean
    public MessageService messageService() {
        return new MessageService(userService(), chatRoomService(), userRoomRepository);
    }

    @Bean
    public NotificationService NotificationService() {
        return new NotificationService(notificationRepository);
    }

    @Bean
    public FilterRegistrationBean shallowEtagHeaderFilter() {
        var frb = new FilterRegistrationBean();
        frb.setFilter(new ShallowEtagHeaderFilter());
        frb.addUrlPatterns("/images/*");
        return frb;
    }

}
