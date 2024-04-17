package com.zangho.game.server.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zangho.game.server.define.AllowedImageType;
import com.zangho.game.server.domain.UploadChatImageRequest;
import com.zangho.game.server.domain.chat.ChatImage;
import com.zangho.game.server.helper.Helpers;
import com.zangho.game.server.repository.chat.ChatImageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;
import java.util.regex.Pattern;

public class ChatImageService {

    private final Logger logger = LoggerFactory.getLogger(ChatImageService.class);
    private final ChatImageRepository chatImageRepository;

    public ChatImageService(ChatImageRepository chatImageRepository) {
        this.chatImageRepository = chatImageRepository;
    }

    public Optional<ChatImage> saveUploadChatImage(UploadChatImageRequest chatImage) {
        return saveUploadChatImage(chatImage.getChatId(), chatImage.getRoomId(), chatImage.getMime(), chatImage.getBase64Large(), chatImage.getBase64Small());
    }

    public Optional<ChatImage> saveUploadChatImage(String chatId, String roomId, AllowedImageType mime, String base64Large, String base64Small) {
        if (chatId.isEmpty())
            return Optional.empty();

        if (roomId.isEmpty())
            return Optional.empty();

        if (1 > mime.getNumber())
            return Optional.empty();

        if (base64Large.isEmpty())
            return Optional.empty();

        if (!mime.equals(AllowedImageType.SVG) && base64Small.isEmpty())
            return Optional.empty();

        var uploadedChatImage = new ChatImage(chatId, mime);
        var result = chatImageRepository.save(uploadedChatImage);
        return Optional.ofNullable(result);
    }

    public Optional<ChatImage> findChatImageByChatId(String chatId) {
        return chatImageRepository.findByChatId(chatId);
    }

}
