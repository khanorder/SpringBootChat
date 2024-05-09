package com.zangho.game.server.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zangho.game.server.domain.request.ReqSubscription;
import com.zangho.game.server.domain.response.ResSubscription;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.service.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;

@Controller
public class NotifyController {

    private final Logger logger = LoggerFactory.getLogger(NotifyController.class);
    private final ObjectMapper objectMapper;
    private final MessageService messageService;
    private final UserService userService;

    public NotifyController(
            MessageService messageService,
            UserService userService
    ) {
        this.objectMapper = new ObjectMapper();
        this.messageService = messageService;
        this.userService = userService;
    }

    @PostMapping(value = "/notify/getPublicKey")
    @ResponseBody
    public String getPublicKey(HttpServletRequest request) throws Exception {
        var response = new HashMap<String, Object>();
        response.put("publicKey", messageService.getPublicKey());

        return objectMapper.writeValueAsString(response);
    }

    @PostMapping(value = "/notify/subscription")
    @ResponseBody
    public String subscription(Authentication authentication, @RequestBody ReqSubscription reqSubscription) throws Exception {
        var response = new ResSubscription();
        String userId = "";
        try {
            var user = (User)authentication.getPrincipal();
            userId = user.getId();
        } catch (Exception ex) {
            logger.info(ex.getMessage(), ex);
        }

        response.setResult(userService.saveUserSubscription(userId, reqSubscription.getSubscription()));
        return objectMapper.writeValueAsString(response);
    }

    @PostMapping(value = "/notify/unsubscription")
    @ResponseBody
    public void unsubscription(@RequestBody String endpoint) {
        messageService.unsubscribe(endpoint);
    }
}
