package com.zangho.game.server.service;

import com.zangho.game.server.define.AllowedImageType;
import com.zangho.game.server.domain.request.ReqUploadChatImage;
import com.zangho.game.server.domain.chat.ChatImage;
import com.zangho.game.server.repository.chat.ChatImageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

public class ChatImageService {

    private final Logger logger = LoggerFactory.getLogger(ChatImageService.class);
    private final ChatImageRepository chatImageRepository;

    public ChatImageService(ChatImageRepository chatImageRepository) {
        this.chatImageRepository = chatImageRepository;
    }

    public Optional<ChatImage> saveUploadChatImage(ReqUploadChatImage reqUploadChatImage) {
        if (reqUploadChatImage.getChatId().isEmpty())
            return Optional.empty();

        if (reqUploadChatImage.getRoomId().isEmpty())
            return Optional.empty();

        if (1 > reqUploadChatImage.getMime().getNumber())
            return Optional.empty();

        if (reqUploadChatImage.getBase64Original().isEmpty())
            return Optional.empty();

        var uploadedChatImage = new ChatImage(reqUploadChatImage.getChatId(), reqUploadChatImage.getMime());
        var result = chatImageRepository.save(uploadedChatImage);
        return Optional.ofNullable(result);
    }

    public Optional<ChatImage> findChatImageByChatId(String chatId) {
        return chatImageRepository.findByChatId(chatId);
    }

}
