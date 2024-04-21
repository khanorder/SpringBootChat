package com.zangho.game.server.configuration;

import com.zangho.game.server.repository.chat.ChatImageRepository;
import com.zangho.game.server.repository.chat.ChatRepository;
import com.zangho.game.server.repository.chat.ChatRoomRepository;
import com.zangho.game.server.repository.chat.UserRoomRepository;
import com.zangho.game.server.repository.user.DisposedTokenRepository;
import com.zangho.game.server.repository.user.NotificationRepository;
import com.zangho.game.server.repository.user.RelationRepository;
import com.zangho.game.server.repository.user.UserRepository;
import com.zangho.game.server.service.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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

    public SpringConfiguration(
        UserRepository userRepository,
        ChatRoomRepository chatRoomRepository,
        ChatRepository chatRepository,
        ChatImageRepository chatImageRepository,
        UserRoomRepository userRoomRepository,
        RelationRepository relationRepository,
        NotificationRepository notificationRepository,
        DisposedTokenRepository disposedTokenRepository
    ) {
        this.userRepository = userRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.chatRepository = chatRepository;
        this.chatImageRepository = chatImageRepository;
        this.userRoomRepository = userRoomRepository;
        this.relationRepository = relationRepository;
        this.notificationRepository = notificationRepository;
        this.disposedTokenRepository = disposedTokenRepository;
    }

    @Bean
    public JwtService jwtService() {
        return new JwtService(disposedTokenRepository);
    }

    @Bean
    public UserService userService() {
        return new UserService(userRepository, chatRoomRepository, userRoomRepository, relationRepository);
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
        return new MessageService(chatRoomService(), userRoomRepository);
    }

    @Bean
    public NotificationService NotificationService() {
        return new NotificationService(notificationRepository);
    }

}
