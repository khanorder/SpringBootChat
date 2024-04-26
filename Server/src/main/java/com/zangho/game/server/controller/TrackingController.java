package com.zangho.game.server.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zangho.game.server.domain.request.ReqVisit;
import com.zangho.game.server.helper.Helpers;
import com.zangho.game.server.service.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@Controller
public class TrackingController {

    private final Logger logger = LoggerFactory.getLogger(TrackingController.class);
    private final VisitService visitService;
    private final ObjectMapper objectMapper;

    public TrackingController(
            VisitService visitService
    ) {
        this.visitService = visitService;
        this.objectMapper = new ObjectMapper();
    }

    @PostMapping(value = "/tracking/visit")
    @ResponseBody
    public String visit(@RequestBody ReqVisit reqVisit, HttpServletRequest request) throws Exception {
        var response = new HashMap<String, Object>();
        var result = false;

        try {
            reqVisit.ip = Helpers.getRemoteIP(request);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return (new ObjectMapper()).writeValueAsString(response);
        }

        try {
            result = visitService.saveVisit(reqVisit);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }

        response.put("result", result);
        return objectMapper.writeValueAsString(response);
    }

}
