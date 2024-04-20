package com.zangho.game.server.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class HomeController {

    @GetMapping(value = "/")
    @ResponseBody
    public ResponseEntity<String> home() {
        return ResponseEntity.notFound().build();
    }
}
