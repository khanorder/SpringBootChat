package com.zangho.game.server.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zangho.game.server.define.AllowedImageType;
import com.zangho.game.server.define.SavedImageSize;
import com.zangho.game.server.domain.request.ReqDownloadChatImage;
import com.zangho.game.server.domain.request.ReqUploadChatImage;
import com.zangho.game.server.domain.response.ResDownloadChatImage;
import com.zangho.game.server.error.ErrorDownloadChatImage;
import com.zangho.game.server.helper.Helpers;
import com.zangho.game.server.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.Optional;

@Controller
public class APIController {

    private final Logger logger = LoggerFactory.getLogger(APIController.class);
    private final ChatService chatService;
    private final ChatImageService chatImageService;
    private final ObjectMapper objectMapper;

    public APIController(
            ChatService chatService,
            ChatImageService chatImageService
    ) {
        this.chatService = chatService;
        this.chatImageService = chatImageService;
        this.objectMapper = new ObjectMapper();
    }

    @PostMapping(value = "/api/uploadChatImage")
    @ResponseBody
    public String uploadChatImage(@RequestBody ReqUploadChatImage reqUploadChatImage) throws Exception {
        var response = new HashMap<String, Object>();
        response.put("result", false);

        try {
            if (null == reqUploadChatImage.getBase64Original() || reqUploadChatImage.getBase64Original().isEmpty())
                return objectMapper.writeValueAsString(response);

            var result = chatImageService.saveUploadChatImage(reqUploadChatImage);
            if (result.isEmpty())
                return objectMapper.writeValueAsString(response);

            var roomIdBase62 = Helpers.getBase62FromUUID(reqUploadChatImage.getRoomId());

            var currentPath = System.getProperty("user.dir");
            var smallDirectoryPath = Paths.get(currentPath, "images", "chat", "small", roomIdBase62);
            var largeDirectoryPath = Paths.get(currentPath, "images", "chat", "large", roomIdBase62);
            var originalDirectoryPath = Paths.get(currentPath, "images", "chat", "original", roomIdBase62);
            if (!Files.isDirectory(smallDirectoryPath))
                Files.createDirectories(smallDirectoryPath);

            if (!Files.isDirectory(largeDirectoryPath))
                Files.createDirectories(largeDirectoryPath);

            if (!Files.isDirectory(originalDirectoryPath))
                Files.createDirectories(originalDirectoryPath);

            var extension = Helpers.getImageExtension(result.get().getMime());
            var fileName = Helpers.getBase62FromUUID(result.get().getId());
            var bytesOriginalImage = Base64.getDecoder().decode(reqUploadChatImage.getBase64Original());
            var originalImagePath = Paths.get(originalDirectoryPath.toString(), fileName + "." + extension);
            var fosOriginal = new FileOutputStream(originalImagePath.toString());
            fosOriginal.write(bytesOriginalImage);
            fosOriginal.flush();
            fosOriginal.close();

            if (null != reqUploadChatImage.getBase64Large() && !reqUploadChatImage.getBase64Large().isEmpty()) {
                var bytesLargeImage = Base64.getDecoder().decode(reqUploadChatImage.getBase64Large());
                var largeImagePath = Paths.get(largeDirectoryPath.toString(), fileName + "." + extension);
                var fosLarge = new FileOutputStream(largeImagePath.toString());
                fosLarge.write(bytesLargeImage);
                fosLarge.flush();
                fosLarge.close();
            }

            if (null != reqUploadChatImage.getBase64Small() && !reqUploadChatImage.getBase64Small().isEmpty()) {
                var bytesSmallImage = Base64.getDecoder().decode(reqUploadChatImage.getBase64Small());
                var smallImagePath = Paths.get(smallDirectoryPath.toString(), fileName + "." + extension);
                var fosSmall = new FileOutputStream(smallImagePath.toString());
                fosSmall.write(bytesSmallImage);
                fosSmall.flush();
                fosSmall.close();
            }

            response.put("result", true);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }

        return objectMapper.writeValueAsString(response);
    }

    @PostMapping(value = "/api/download/chatImage", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<String> chatImage(@RequestBody ReqDownloadChatImage reqDownloadChatImage) {
        var response = new ResDownloadChatImage();
        response.setResult(ErrorDownloadChatImage.FAILED_TO_DOWNLOAD);
        try {
            if (reqDownloadChatImage.getChatId().isEmpty()) {
                response.setResult(ErrorDownloadChatImage.ID_REQUIRED);
                return ResponseEntity.ok().body(objectMapper.writeValueAsString(response));
            }

            var optChatImage = chatImageService.findChatImageByChatId(reqDownloadChatImage.getChatId());
            if (optChatImage.isEmpty()) {
                response.setResult(ErrorDownloadChatImage.NOT_FOUND_DATA);
                return ResponseEntity.ok().body(objectMapper.writeValueAsString(response));
            }

            var chatImage = optChatImage.get();
            if (chatImage.getChatId().isEmpty()) {
                response.setResult(ErrorDownloadChatImage.NOT_FOUND_DATA);
                return ResponseEntity.ok().body(objectMapper.writeValueAsString(response));
            }

            if (chatImage.getId().isEmpty()) {
                response.setResult(ErrorDownloadChatImage.NOT_FOUND_DATA);
                return ResponseEntity.ok().body(objectMapper.writeValueAsString(response));
            }

            var optChat = chatService.findById(chatImage.getChatId());
            if (optChat.isEmpty()) {
                response.setResult(ErrorDownloadChatImage.NOT_FOUND_DATA);
                return ResponseEntity.ok().body(objectMapper.writeValueAsString(response));
            }

            var roomIdBase62 = Helpers.getBase62FromUUID(optChat.get().getRoomId());

            if (AllowedImageType.NONE.equals(chatImage.getMime())) {
                response.setResult(ErrorDownloadChatImage.NOT_FOUND_DATA);
                return ResponseEntity.ok().body(objectMapper.writeValueAsString(response));
            }

            var extension = Helpers.getImageExtension(chatImage.getMime());
            if (extension.isEmpty()) {
                response.setResult(ErrorDownloadChatImage.NOT_FOUND_DATA);
                return ResponseEntity.ok().body(objectMapper.writeValueAsString(response));
            }

            var currentPath = System.getProperty("user.dir");

            var smallDirectoryPath = Paths.get(currentPath, "images", "chat", "small", roomIdBase62);
            var largeDirectoryPath = Paths.get(currentPath, "images", "chat", "large", roomIdBase62);
            var originalDirectoryPath = Paths.get(currentPath, "images", "chat", "original", roomIdBase62);

            var contentType = "";

            switch (chatImage.getMime()) {
                case PNG:
                    contentType = "image/png";
                    break;

                case JPG:
                    contentType = "image/jpeg";
                    break;

                case GIF:
                    contentType = "image/gif";
                    break;

                case BMP:
                    contentType = "image/bmp";
                    break;

                case SVG:
                    contentType = "image/svg+xml";
                    break;
            }

            var imagePath = Paths.get(originalDirectoryPath.toString(), Helpers.getBase62FromUUID(chatImage.getId()) + "." + extension);
            if (!Files.exists(imagePath)) {
                imagePath = Paths.get(largeDirectoryPath.toString(), Helpers.getBase62FromUUID(chatImage.getId()) + "." + extension);
                if (!Files.exists(imagePath)) {
                    imagePath = Paths.get(smallDirectoryPath.toString(), Helpers.getBase62FromUUID(chatImage.getId()) + "." + extension);
                    if (!Files.exists(imagePath)) {
                        response.setResult(ErrorDownloadChatImage.NOT_FOUND_FILE);
                        return ResponseEntity.ok().body(objectMapper.writeValueAsString(response));
                    }
                }
            }

            var imageBytes = Files.readAllBytes(imagePath);
            var fileBase64 = Base64.getEncoder().encodeToString(imageBytes);
            response.setResult(ErrorDownloadChatImage.NONE);
            response.setMime(contentType);
            response.setFileBase64(fileBase64);
            response.setFileName("");

            return ResponseEntity.ok().body(objectMapper.writeValueAsString(response));
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return ResponseEntity.notFound().build();
        }
    }
}
