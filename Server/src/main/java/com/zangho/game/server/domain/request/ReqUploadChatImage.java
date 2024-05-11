package com.zangho.game.server.domain.request;

import com.zangho.game.server.define.AllowedImageType;
import lombok.Data;

@Data
public class ReqUploadChatImage {
    private String roomId;
    private String chatId;
    private AllowedImageType mime;
    private String base64Original;
    private String base64Large;
    private String base64Small;
}
