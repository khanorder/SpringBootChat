package com.zangho.game.server.domain;

import lombok.Data;
import nl.martijndwars.webpush.Subscription;

@Data
public class UploadChatImageRequest {
    private String chatId;
    private String roomId;
    private String userId;
    private String smallData;
    private String largeData;
}
