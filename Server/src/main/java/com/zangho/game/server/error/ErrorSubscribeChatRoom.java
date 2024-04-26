package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorSubscribeChatRoom implements Types {
    NONE(0),
    REQUIRED_ROOM_ID(1),
    REQUIRED_USER_ID(2),
    NOT_FOUND_CHAT_ROOM(3),
    EMPTY_USER_IN_ROOM(4),
    NOT_FOUND_USER_IN_ROOM(5),
    ALREADY_SUBSCRIBE_ROOM(6);

    private final int number;

    ErrorSubscribeChatRoom(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorSubscribeChatRoom> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

