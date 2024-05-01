package com.zangho.game.server.domain.response;

import com.zangho.game.server.error.ErrorSignIn;
import com.zangho.game.server.error.ErrorSubscribeNotification;
import lombok.Data;

@Data
public class ResSubscription {
    private ErrorSubscribeNotification result = ErrorSubscribeNotification.FAILED_SUBSCRIBE;
}
