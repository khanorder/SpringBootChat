package com.zangho.game.server.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zangho.game.server.define.AllowedImageType;
import com.zangho.game.server.define.SavedImageSize;
import com.zangho.game.server.domain.SubscriptionRequest;
import com.zangho.game.server.domain.UploadChatImageRequest;
import com.zangho.game.server.domain.Visit;
import com.zangho.game.server.helper.Helpers;
import com.zangho.game.server.service.*;
import jakarta.servlet.http.HttpServletRequest;
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
import java.util.UUID;

@Controller
public class APIController {

    private final Logger logger = LoggerFactory.getLogger(APIController.class);
    private final ChatRoomService chatRoomService;
    private final VisitService visitService;
    private final UserService userService;
    private final ChatService chatService;
    private final ChatImageService chatImageService;
    private final MessageService messageService;

    public APIController(
            ChatRoomService chatRoomService,
            VisitService visitService,
            UserService userService,
            ChatService chatService,
            ChatImageService chatImageService,
            MessageService messageService
    ) {
        this.chatRoomService = chatRoomService;
        this.visitService = visitService;
        this.userService = userService;
        this.chatService = chatService;
        this.chatImageService = chatImageService;
        this.messageService = messageService;
    }

    @PostMapping(value = "/api/visit")
    @ResponseBody
    public String visit(@RequestBody Visit visit, HttpServletRequest request) throws Exception {
        var response = new HashMap<String, Object>();
        var result = false;

        try {
            visit.ip = Helpers.getRemoteIP(request);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return (new ObjectMapper()).writeValueAsString(response);
        }

        try {
            result = visitService.saveVisit(visit);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }

        response.put("result", result);
        return (new ObjectMapper()).writeValueAsString(response);
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
    public String subscription(@RequestBody SubscriptionRequest subscriptionRequest) throws Exception {
        var response = new HashMap<String, Object>();
        chatRoomService.subscribeUserRoom(subscriptionRequest.getSubscription(), subscriptionRequest.getRoomId(), subscriptionRequest.getUserId());
        var result = messageService.subscribeChatRoom(subscriptionRequest.getSubscription(), subscriptionRequest.getRoomId(), subscriptionRequest.getUserId());
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
    public String uploadChatImage(@RequestBody UploadChatImageRequest uploadChatImageRequest) throws Exception {
        var response = new HashMap<String, Object>();
        response.put("result", false);

        try {
            var result = chatImageService.saveUploadChatImage(uploadChatImageRequest);
            if (result.isEmpty())
                return (new ObjectMapper()).writeValueAsString(response);

            var roomIdBase62 = Helpers.getBase62FromUUID(uploadChatImageRequest.getRoomId());

            var currentPath = System.getProperty("user.dir");
            var smallDirectoryPath = Paths.get(currentPath, "images", "chat", "small", roomIdBase62);
            var largeDirectoryPath = Paths.get(currentPath, "images", "chat", "large", roomIdBase62);
            if (!Files.isDirectory(smallDirectoryPath))
                Files.createDirectories(smallDirectoryPath);

            if (!Files.isDirectory(largeDirectoryPath))
                Files.createDirectories(largeDirectoryPath);

            var extension = Helpers.getImageExtension(result.get().getMime());
            var fileName = Helpers.getBase62FromUUID(result.get().getId());
            var bytesLargeImage = Base64.getDecoder().decode(uploadChatImageRequest.getBase64Large());
            var largeImagePath = Paths.get(largeDirectoryPath.toString(), fileName + "." + extension);
            var fosLarge = new FileOutputStream(largeImagePath.toString());
            fosLarge.write(bytesLargeImage);
            fosLarge.flush();
            fosLarge.close();

            if (!uploadChatImageRequest.getBase64Small().isEmpty()) {
                var bytesSmallImage = Base64.getDecoder().decode(uploadChatImageRequest.getBase64Small());
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

    @GetMapping(value = "/api/chatImage/{id}")
    @ResponseBody
    public ResponseEntity<byte[]> chatImage(@PathVariable String id) {
        return chatImageResponse(id,SavedImageSize.LARGE);
    }

    @GetMapping(value = "/api/chatSmallImage/{id}")
    @ResponseBody
    public ResponseEntity<byte[]> chatSmallImage(@PathVariable String id) {
        return chatImageResponse(id,SavedImageSize.SMALL);
    }

    private ResponseEntity<byte[]> chatImageResponse(String id, SavedImageSize size) {
        try {
            if (id.isEmpty())
                return ResponseEntity.notFound().build();

            var optChatImage = chatImageService.findChatImageByChatId(id);
            if (optChatImage.isEmpty())
                return ResponseEntity.notFound().build();

            var chatImage = optChatImage.get();
            if (chatImage.getChatId().isEmpty())
                return ResponseEntity.notFound().build();

            if (chatImage.getId().isEmpty())
                return ResponseEntity.notFound().build();

            var optChat = chatService.findById(chatImage.getChatId());
            if (optChat.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            var roomIdBase62 = Helpers.getBase62FromUUID(optChat.get().getRoomId());

            if (AllowedImageType.NONE.equals(chatImage.getMime()))
                return ResponseEntity.notFound().build();

            var extension = Helpers.getImageExtension(chatImage.getMime());
            if (extension.isEmpty())
                return ResponseEntity.notFound().build();

            var currentPath = System.getProperty("user.dir");

            var smallDirectoryPath = Paths.get(currentPath, "images", "chat", "small", roomIdBase62);
            var largeDirectoryPath = Paths.get(currentPath, "images", "chat", "large", roomIdBase62);

            Optional<Path> chatImagePath = switch (size) {
                case LARGE -> Optional.of(largeDirectoryPath);
                default -> Optional.of(smallDirectoryPath);
            };

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
                    chatImagePath = Optional.of(largeDirectoryPath);
                    break;
            }

            var imagePath = Paths.get(chatImagePath.get().toString(), Helpers.getBase62FromUUID(chatImage.getId()) + "." + extension);
            if (!Files.exists(imagePath))
                return ResponseEntity.notFound().build();

            return ResponseEntity.ok().header("Content-Type", contentType).body(Files.readAllBytes(imagePath));
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping(value = "/api/profileImage/{id}")
    @ResponseBody
    public ResponseEntity<byte[]> profileImage(@PathVariable String id) {
        return  profileImageResponse(id, SavedImageSize.LARGE);
    }

    @GetMapping(value = "/api/profileThumb/{id}")
    @ResponseBody
    public ResponseEntity<byte[]> profileThumbImage(@PathVariable String id) {
        return  profileImageResponse(id, SavedImageSize.SMALL);
    }

    private ResponseEntity<byte[]> profileImageResponse(String id, SavedImageSize size) {
        try {
            if (id.isEmpty())
                return ResponseEntity.notFound().build();

            var optUser = userService.findUser(id);
            if (optUser.isEmpty())
                return ResponseEntity.notFound().build();

            var user = optUser.get();

            if (user.getProfileImage().isEmpty())
                return ResponseEntity.notFound().build();

            if (AllowedImageType.NONE.equals(user.getProfileMime()))
                return ResponseEntity.notFound().build();

            var extension = Helpers.getImageExtension(user.getProfileMime());
            if (extension.isEmpty())
                return ResponseEntity.notFound().build();

            var currentPath = System.getProperty("user.dir");

            var largePath = Paths.get(currentPath, "images", "profiles", "large");
            var smallPath = Paths.get(currentPath, "images", "profiles", "small");

            Optional<Path> profileImagePath = switch (size) {
                case LARGE -> Optional.of(largePath);
                default -> Optional.of(smallPath);
            };
            var contentType = "";

            switch (user.getProfileMime()) {
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
                    profileImagePath = Optional.of(largePath);
                    break;
            }

            var imagePath = Paths.get(profileImagePath.get().toString(), user.getProfileImage() + "." + extension);
            if (!Files.exists(imagePath))
                return ResponseEntity.notFound().build();

            return ResponseEntity.ok().header("Content-Type", contentType).body(Files.readAllBytes(imagePath));
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return ResponseEntity.notFound().build();
        }
    }
}
