package com.zangho.game.server.domain.response;

import com.zangho.game.server.error.ErrorChangePassword;
import lombok.Data;

@Data
public class ResChangePassword {
    private ErrorChangePassword result;
}
