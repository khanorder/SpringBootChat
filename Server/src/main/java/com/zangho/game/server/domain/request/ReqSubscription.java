package com.zangho.game.server.domain.request;

import lombok.Data;

@Data
public class ReqSubscription {
    private nl.martijndwars.webpush.Subscription subscription;
    private String roomId;
    private String userId;
}
