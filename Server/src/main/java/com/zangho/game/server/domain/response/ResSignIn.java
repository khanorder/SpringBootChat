package com.zangho.game.server.domain.response;

import com.zangho.game.server.error.ErrorSignIn;
import lombok.Data;

@Data
public class ResSignIn {
    private ErrorSignIn result;
    private String accessToken;
    private String refreshToken;
}
