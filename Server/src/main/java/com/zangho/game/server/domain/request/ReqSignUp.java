package com.zangho.game.server.domain.request;

import lombok.Data;

@Data
public class ReqSignUp {
    private String token;
    private String userName;
    private String password;
}
