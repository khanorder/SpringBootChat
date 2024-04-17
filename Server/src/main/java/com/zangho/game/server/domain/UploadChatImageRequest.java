package com.zangho.game.server.domain;

import com.zangho.game.server.define.AllowedImageType;
import lombok.Data;
import nl.martijndwars.webpush.Subscription;

@Data
public class UploadChatImageRequest {
    private String roomId;
    private String chatId;
    private AllowedImageType mime;
    private String base64Large;
    private String base64Small;
}
