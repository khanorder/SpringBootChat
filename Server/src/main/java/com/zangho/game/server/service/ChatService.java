package com.zangho.game.server.service;

import com.zangho.game.server.define.ChatType;
import com.zangho.game.server.domain.UploadChatImageRequest;
import com.zangho.game.server.domain.chat.Chat;
import com.zangho.game.server.domain.chat.ChatImage;
import com.zangho.game.server.repository.chat.ChatImageRepository;
import com.zangho.game.server.repository.chat.ChatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import java.util.Optional;
import java.util.regex.Pattern;

public class ChatService {

    private final Logger logger = LoggerFactory.getLogger(ChatService.class);
    private final ChatRepository chatRepostory;

    public ChatService(ChatRepository chatRepostory) {
        this.chatRepostory = chatRepostory;
    }

    public Optional<Chat> saveChat(Chat chat) throws Exception {
        if (chat.getChatId().isEmpty())
            return Optional.empty();

        if (chat.getRoomId().isEmpty())
            return Optional.empty();

        if (chat.getUserId().isEmpty())
            return Optional.empty();

        if (ChatType.IMAGE != chat.getType() && chat.getMessage().isEmpty())
            return Optional.empty();

        var resultChat = chatRepostory.save(chat);
        return Optional.ofNullable(resultChat);
    }

    public Optional<Chat> saveChat(String chatId, String roomId, String userId, ChatType chatType, String message, Date sendAt) throws Exception {
        return saveChat(new Chat(chatId, roomId, userId, chatType, message, sendAt));
    }

}
