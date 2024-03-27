package com.zangho.game.server.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zangho.game.server.domain.SubscriptionRequest;
import com.zangho.game.server.domain.Visit;
import com.zangho.game.server.helper.Helpers;
import com.zangho.game.server.service.ChatService;
import com.zangho.game.server.service.MessageService;
import com.zangho.game.server.service.UserService;
import com.zangho.game.server.service.VisitService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@Controller
public class APIController {

    private final Logger logger = LoggerFactory.getLogger(APIController.class);
    private final ChatService chatService;
    private final VisitService visitService;
    private final UserService userService;
    private final MessageService messageService;

    public APIController(
            ChatService chatService,
            VisitService visitService,
            UserService userService,
            MessageService messageService
    ) {
        this.chatService = chatService;
        this.visitService = visitService;
        this.userService = userService;
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
    public String subscription(@RequestBody SubscriptionRequest subRequest, HttpServletRequest request) throws Exception {
        var result = messageService.subscribeChatRoom(subRequest.getSubscription(), subRequest.getRoomId(), subRequest.getUserId());
        var response = """
            {"result":%d}
        """;
        return String.format(response, result.getNumber());
    }

    @PostMapping(value = "/api/unsubscription")
    @ResponseBody
    public void unsubscription(@RequestBody String endpoint, HttpServletRequest request) throws Exception {
        messageService.unsubscribe(endpoint);
    }
}
