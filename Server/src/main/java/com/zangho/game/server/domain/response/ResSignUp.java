package com.zangho.game.server.domain.response;

import com.zangho.game.server.error.ErrorSignUp;
import lombok.Data;

@Data
public class ResSignUp {
    private ErrorSignUp result;
    private String accessToken;
    private String refreshToken;
}
