package com.zangho.game.server.domain.request;

import lombok.Data;

@Data
public class ReqChangePassword {
    private String password;
    private String newPassword;
    private String newPasswordConfirm;
}
