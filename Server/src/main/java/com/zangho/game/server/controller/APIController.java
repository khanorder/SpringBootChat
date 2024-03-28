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
    private final ChatService chatService;
    private final VisitService visitService;
    private final UserService userService;
    private final ChatImageService chatImageService;
    private final MessageService messageService;

    public APIController(
            ChatService chatService,
            VisitService visitService,
            UserService userService,
            ChatImageService chatImageService,
            MessageService messageService
    ) {
        this.chatService = chatService;
        this.visitService = visitService;
        this.userService = userService;
        this.chatImageService = chatImageService;
        this.messageService = messageService;
    }

    @PostMapping(value = "/api/room/{id}")
    @ResponseBody
    public String room(@PathVariable("id") String id) throws Exception {
        if (id.isEmpty()) {
            return "";
        }

        try {
            var chatRoom = chatService.findRoomById(id);
            if (chatRoom.isEmpty())
                return "{}";

            return (new ObjectMapper()).writeValueAsString(chatRoom.get().getInfo());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
        return "{}";
    }

    @PostMapping(value = "/api/visit")
    @ResponseBody
    public String visit(@RequestBody Visit visit, HttpServletRequest request) throws Exception {
        var response = new HashMap<String, Object>();
        var result = false;

        try {
            visit.session = Helpers.getBase62FromUUID(visit.session);
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
        var publicKey = messageService.getPublicKey();
        var response = """
            {"publicKey":"%s"}
        """;
        return String.format(response, publicKey);
    }

    @PostMapping(value = "/api/subscription")
    @ResponseBody
    public String subscription(@RequestBody SubscriptionRequest subscriptionRequest) throws Exception {
        var response = new HashMap<String, Object>();
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

        var base64Image = chatImage.getData().replaceAll("^data:[^,]+", "").replace(",", "");

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

        var base64Image = chatImage.getSmallData().replaceAll("^data:[^,]+", "").replace(",", "");

        try {
            return Base64.getDecoder().decode(base64Image);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return new byte[0];
        }
    }
}
