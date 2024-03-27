package com.zangho.game.server.domain;

import lombok.Data;
import nl.martijndwars.webpush.Subscription;

@Data
public class SubscriptionRequest {
    private Subscription subscription;
    private String roomId;
    private String userId;
}
