package com.zangho.game.server.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zangho.game.server.domain.SubscriptionRequest;
import com.zangho.game.server.domain.UploadChatImageRequest;
import com.zangho.game.server.domain.Visit;
import com.zangho.game.server.helper.Helpers;
import com.zangho.game.server.service.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.HashMap;

@Controller
public class APIController {

    private final Logger logger = LoggerFactory.getLogger(APIController.class);
    private final ChatRoomService chatRoomService;
    private final VisitService visitService;
    private final UserService userService;
    private final ChatImageService chatImageService;
    private final MessageService messageService;

    public APIController(
            ChatRoomService chatRoomService,
            VisitService visitService,
            UserService userService,
            ChatImageService chatImageService,
            MessageService messageService
    ) {
        this.chatRoomService = chatRoomService;
        this.visitService = visitService;
        this.userService = userService;
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

        if (uploadChatImageRequest.getChatId().isEmpty())
            return (new ObjectMapper()).writeValueAsString(response);

        if (uploadChatImageRequest.getSmallData().isEmpty())
            return (new ObjectMapper()).writeValueAsString(response);

        if (uploadChatImageRequest.getLargeData().isEmpty())
            return (new ObjectMapper()).writeValueAsString(response);

        var result = chatImageService.saveUploadChatImage(uploadChatImageRequest);
        response.put("result", result);

        return (new ObjectMapper()).writeValueAsString(response);
    }

    @GetMapping(value = "/api/chatImage/{id}", produces = "image/*")
    @ResponseBody
    public byte[] chatImage(@PathVariable String id) throws Exception {
        if (id.isEmpty())
            return new byte[0];

        var optChatImage = chatImageService.findChatImageByChatId(id);
        if (optChatImage.isEmpty())
            return new byte[0];

        var chatImage = optChatImage.get();

        if (chatImage.getData().isEmpty())
            return new byte[0];

        var base64Image = chatImage.getData().replaceAll("^data:[^,]+,", "");

        try {
            return Base64.getDecoder().decode(base64Image);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return new byte[0];
        }
    }

    @GetMapping(value = "/api/chatSmallImage/{id}", produces = "image/*")
    @ResponseBody
    public byte[] chatSmallImage(@PathVariable String id) throws Exception {
        if (id.isEmpty())
            return new byte[0];

        var optChatImage = chatImageService.findChatImageByChatId(id);
        if (optChatImage.isEmpty())
            return new byte[0];

        var chatImage = optChatImage.get();

        if (chatImage.getSmallData().isEmpty())
            return new byte[0];

        var base64Image = chatImage.getSmallData().replaceAll("^data:[^,]+,", "");

        try {
            return Base64.getDecoder().decode(base64Image);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return new byte[0];
        }
    }

    @GetMapping(value = "/api/profileImage/{id}", produces = "image/*")
    @ResponseBody
    public byte[] profileImage(@PathVariable String id) throws Exception {
        if (id.isEmpty())
            return new byte[0];

        var optUser = userService.findUser(id);
        if (optUser.isEmpty())
            return new byte[0];

        var user = optUser.get();

        if (user.getProfileImage().isEmpty())
            return new byte[0];

        var base64Image = user.getProfileImage();

        try {
            return Base64.getDecoder().decode(base64Image);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return new byte[0];
        }
    }

    @GetMapping(value = "/api/profileThumb/{id}", produces = "image/*")
    @ResponseBody
    public byte[] profileThumbImage(@PathVariable String id) throws Exception {
        if (id.isEmpty())
            return new byte[0];

        var optUser = userService.findUser(id);
        if (optUser.isEmpty())
            return new byte[0];

        var user = optUser.get();

        if (user.getProfileThumb().isEmpty())
            return new byte[0];

        var base64Image = user.getProfileThumb();

        try {
            return Base64.getDecoder().decode(base64Image);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return new byte[0];
        }
    }
}
