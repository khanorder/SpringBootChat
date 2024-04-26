package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorRemoveChatRoom implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    REQUIRED_ROOM_ID(2),
    NOT_FOUND_CHAT_ROOM(3),
    NOT_ALLOWED_OPEN_TYPE(4),
    NOT_IN_ROOM(5),
    FAILED_TO_REMOVE(6);

    private final int number;

    ErrorRemoveChatRoom(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorRemoveChatRoom> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

