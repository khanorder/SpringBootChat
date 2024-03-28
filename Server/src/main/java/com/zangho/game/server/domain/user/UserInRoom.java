package com.zangho.game.server.domain.user;

import lombok.*;
import nl.martijndwars.webpush.Subscription;

import java.util.Optional;

@Data
public class UserInRoom {
    private String id;
    private String name;
    private Optional<Subscription> subscription;

    public UserInRoom() {
        this.id = "";
        this.name = "";
        this.subscription = Optional.empty();
    }

    public UserInRoom(String id, String name) {
        this.id = id;
        this.name = name;
        subscription = Optional.empty();
    }
}
