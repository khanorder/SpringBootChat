package com.zangho.game.server.domain.request;

import lombok.Data;

@Data
public class ReqSignIn {
    private String userName;
    private String password;
}
