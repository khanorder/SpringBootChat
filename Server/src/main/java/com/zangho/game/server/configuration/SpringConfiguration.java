package com.zangho.game.server.configuration;

import com.zangho.game.server.repository.chat.ChatRepository;
import com.zangho.game.server.repository.chat.ChatRoomRepository;
import com.zangho.game.server.repository.chat.UserRoomRepository;
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
    private final UserRoomRepository userRoomRepository;
    private final RelationRepository relationRepository;

    public SpringConfiguration(UserRepository userRepository, ChatRoomRepository chatRoomRepository, ChatRepository chatRepository, UserRoomRepository userRoomRepository, RelationRepository relationRepository) {
        this.userRepository = userRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.chatRepository = chatRepository;
        this.userRoomRepository = userRoomRepository;
        this.relationRepository = relationRepository;
    }

    @Bean
    public UserService userService () {
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
    public MessageService messageService() {
        return new MessageService(chatRoomService(), userRoomRepository);
    }

}
