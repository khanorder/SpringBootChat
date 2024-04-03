package com.zangho.game.server.configuration;

import com.zangho.game.server.repository.chat.ChatRepository;
import com.zangho.game.server.repository.chat.ChatRoomRepository;
import com.zangho.game.server.repository.chat.UserRoomRepository;
import com.zangho.game.server.repository.user.UserRepository;
import com.zangho.game.server.service.ChatRoomService;
import com.zangho.game.server.service.ChatService;
import com.zangho.game.server.service.MessageService;
import com.zangho.game.server.service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringConfiguration {

    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ChatRepository chatRepository;
    private final UserRoomRepository userRoomRepository;

    public SpringConfiguration(UserRepository userRepository, ChatRoomRepository chatRoomRepository, ChatRepository chatRepository, UserRoomRepository userRoomRepository) {
        this.userRepository = userRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.chatRepository = chatRepository;
        this.userRoomRepository = userRoomRepository;
    }

    @Bean
    public UserService userService () {
        return new UserService(userRepository, chatRoomRepository, userRoomRepository);
    }

    @Bean
    public ChatRoomService chatRoomService() {
        return new ChatRoomService(userRepository, chatRoomRepository, chatRepository, userRoomRepository, userService());
    }

    @Bean
    public ChatService chatService() {
        return new ChatService(chatRepository);
    }

    @Bean
    public MessageService messageService() {
        return new MessageService(chatRoomService());
    }

}
