package com.zangho.game.server.controller;

import com.zangho.game.server.define.AllowedImageType;
import com.zangho.game.server.define.SavedImageSize;
import com.zangho.game.server.helper.Helpers;
import com.zangho.game.server.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

@Controller
public class ImageController {

    private final Logger logger = LoggerFactory.getLogger(ImageController.class);
    private final ChatRoomService chatRoomService;
    private final UserService userService;
    private final ChatService chatService;
    private final ChatImageService chatImageService;
    private final MessageService messageService;

    public ImageController(
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

    @GetMapping(value = "/images/chat/{id}")
    @ResponseBody
    public ResponseEntity<byte[]> chatImage(@PathVariable String id) {
        return chatImageResponse(id,SavedImageSize.LARGE);
    }

    @GetMapping(value = "/images/chat/small/{id}")
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

    @GetMapping(value = "/images/profile/{id}")
    @ResponseBody
    public ResponseEntity<byte[]> profileImage(@PathVariable String id) {
        return  profileImageResponse(id, SavedImageSize.LARGE);
    }

    @GetMapping(value = "/images/profile/small/{id}")
    @ResponseBody
    public ResponseEntity<byte[]> profileThumbImage(@PathVariable String id) {
        return  profileImageResponse(id, SavedImageSize.SMALL);
    }

    private ResponseEntity<byte[]> profileImageResponse(String id, SavedImageSize size) {
        try {
            if (id.isEmpty())
                return ResponseEntity.notFound().build();

            var optUser = userService.findUserById(id);
            if (optUser.isEmpty())
                return ResponseEntity.notFound().build();

            var user = optUser.get();
            var currentPath = System.getProperty("user.dir");
            var resourcePath = Paths.get(currentPath, "resources", "images");

            if (user.getProfileImage().isEmpty()) {
                var imagePath = Paths.get(resourcePath.toString(), "user_icon.png");
                if (!Files.exists(imagePath))
                    return ResponseEntity.notFound().build();

                return ResponseEntity.ok().header("Content-Type", "image/svg+xml").body(Files.readAllBytes(imagePath));
            }

            if (AllowedImageType.NONE.equals(user.getProfileMime()))
                return ResponseEntity.notFound().build();

            var extension = Helpers.getImageExtension(user.getProfileMime());
            if (extension.isEmpty())
                return ResponseEntity.notFound().build();

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
