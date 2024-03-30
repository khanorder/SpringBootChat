package com.zangho.game.server.configuration;

import com.zangho.game.server.repository.chat.ChatRepository;
import com.zangho.game.server.repository.chat.ChatRoomRepository;
import com.zangho.game.server.service.ChatRoomService;
import com.zangho.game.server.service.ChatService;
import com.zangho.game.server.service.MessageService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringConfiguration {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatRepository chatRepository;

    public SpringConfiguration(ChatRoomRepository chatRoomRepository, ChatRepository chatRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatRepository = chatRepository;
    }

    @Bean
    public ChatRoomService chatRoomService() {
        return new ChatRoomService(chatRoomRepository, chatRepository);
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
