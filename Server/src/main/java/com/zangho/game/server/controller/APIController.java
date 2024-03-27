package com.zangho.game.server.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zangho.game.server.domain.Visit;
import com.zangho.game.server.helper.Helpers;
import com.zangho.game.server.service.ChatService;
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

    public APIController(ChatService chatService, VisitService visitService) {
        this.chatService = chatService;
        this.visitService = visitService;
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
}
