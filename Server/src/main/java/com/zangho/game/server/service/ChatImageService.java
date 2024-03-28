package com.zangho.game.server.service;

import com.zangho.game.server.domain.UploadChatImageRequest;
import com.zangho.game.server.domain.chat.ChatImage;
import com.zangho.game.server.repository.chat.ChatImageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;
import java.util.regex.Pattern;

public class ChatImageService {

    private final Logger logger = LoggerFactory.getLogger(ChatImageService.class);
    private final ChatImageRepository chatImageRepostory;

    public ChatImageService(ChatImageRepository chatImageRepository) {
        this.chatImageRepostory = chatImageRepository;
    }

    public Optional<ChatImage> saveUploadChatImage(UploadChatImageRequest chatImage) throws Exception {
        return saveUploadChatImage(chatImage.getChatId(), chatImage.getRoomId(), chatImage.getUserId(), chatImage.getLargeData(), chatImage.getSmallData());
    }

    public Optional<ChatImage> saveUploadChatImage(String chatId, String roomId, String userId, String largeData, String smallData) throws Exception {
        if (chatId.isEmpty())
            return Optional.empty();

        if (roomId.isEmpty())
            return Optional.empty();

        if (userId.isEmpty())
            return Optional.empty();

        if (largeData.isEmpty())
            return Optional.empty();

        if (smallData.isEmpty())
            return Optional.empty();

        var pattern = Pattern.compile("(?<=^data:)[^;]+");
        var matcher = pattern.matcher(smallData);
        if (!matcher.find())
            return Optional.empty();

        var mime = matcher.group();
        var emptyChatImage = new ChatImage(chatId, roomId, userId, mime, largeData, smallData);
        var result = chatImageRepostory.save(emptyChatImage);
        return Optional.ofNullable(result);
    }

    public Optional<ChatImage> findChatImageByChatId(String chatId) throws Exception {
        return chatImageRepostory.findByChatId(chatId);
    }

}
