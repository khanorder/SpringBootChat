package com.zangho.game.server.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zangho.game.server.domain.request.ReqSubscription;
import com.zangho.game.server.domain.request.ReqUploadChatImage;
import com.zangho.game.server.helper.Helpers;
import com.zangho.game.server.service.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;

@Controller
public class APIController {

    private final Logger logger = LoggerFactory.getLogger(APIController.class);
    private final ChatRoomService chatRoomService;
    private final UserService userService;
    private final ChatService chatService;
    private final ChatImageService chatImageService;
    private final MessageService messageService;

    public APIController(
            ChatRoomService chatRoomService,
            UserService userService,
            ChatService chatService,
            ChatImageService chatImageService,
            MessageService messageService
    ) {
        this.chatRoomService = chatRoomService;
        this.userService = userService;
        this.chatService = chatService;
        this.chatImageService = chatImageService;
        this.messageService = messageService;
    }

    @PostMapping(value = "/api/getPublicKey")
    @ResponseBody
    public String getPublicKey(HttpServletRequest request) throws Exception {
        var response = new HashMap<String, Object>();
        response.put("publicKey", messageService.getPublicKey());

        return (new ObjectMapper()).writeValueAsString(response);
    }

    @PostMapping(value = "/api/subscription")
    @ResponseBody
    public String subscription(@RequestBody ReqSubscription reqSubscription) throws Exception {
        var response = new HashMap<String, Object>();
        chatRoomService.subscribeUserRoom(reqSubscription.getSubscription(), reqSubscription.getRoomId(), reqSubscription.getUserId());
        var result = messageService.subscribeChatRoom(reqSubscription.getSubscription(), reqSubscription.getRoomId(), reqSubscription.getUserId());
        response.put("result", result.getNumber());

        return (new ObjectMapper()).writeValueAsString(response);
    }

    @PostMapping(value = "/api/unsubscription")
    @ResponseBody
    public void unsubscription(@RequestBody String endpoint) throws Exception {
        messageService.unsubscribe(endpoint);
    }

    @PostMapping(value = "/api/uploadChatImage")
    @ResponseBody
    public String uploadChatImage(@RequestBody ReqUploadChatImage reqUploadChatImage) throws Exception {
        var response = new HashMap<String, Object>();
        response.put("result", false);

        try {
            var result = chatImageService.saveUploadChatImage(reqUploadChatImage);
            if (result.isEmpty())
                return (new ObjectMapper()).writeValueAsString(response);

            var roomIdBase62 = Helpers.getBase62FromUUID(reqUploadChatImage.getRoomId());

            var currentPath = System.getProperty("user.dir");
            var smallDirectoryPath = Paths.get(currentPath, "images", "chat", "small", roomIdBase62);
            var largeDirectoryPath = Paths.get(currentPath, "images", "chat", "large", roomIdBase62);
            if (!Files.isDirectory(smallDirectoryPath))
                Files.createDirectories(smallDirectoryPath);

            if (!Files.isDirectory(largeDirectoryPath))
                Files.createDirectories(largeDirectoryPath);

            var extension = Helpers.getImageExtension(result.get().getMime());
            var fileName = Helpers.getBase62FromUUID(result.get().getId());
            var bytesLargeImage = Base64.getDecoder().decode(reqUploadChatImage.getBase64Large());
            var largeImagePath = Paths.get(largeDirectoryPath.toString(), fileName + "." + extension);
            var fosLarge = new FileOutputStream(largeImagePath.toString());
            fosLarge.write(bytesLargeImage);
            fosLarge.flush();
            fosLarge.close();

            if (!reqUploadChatImage.getBase64Small().isEmpty()) {
                var bytesSmallImage = Base64.getDecoder().decode(reqUploadChatImage.getBase64Small());
                var smallImagePath = Paths.get(smallDirectoryPath.toString(), fileName + "." + extension);
                var fosSmall = new FileOutputStream(smallImagePath.toString());
                fosSmall.write(bytesSmallImage);
                fosSmall.flush();
                fosSmall.close();
            }

            response.put("result", result);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }

        return (new ObjectMapper()).writeValueAsString(response);
    }
}
