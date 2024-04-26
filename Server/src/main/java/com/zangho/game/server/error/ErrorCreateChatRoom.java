package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorCreateChatRoom implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    NOT_ALLOWED_OPEN_TYPE(2),
    NOT_MATCHED_USER(3),
    EXISTS_ROOM(4),
    FAILED_TO_CREATE(5),
    REQUIRED_ROOM_ID(6);

    private final int number;

    ErrorCreateChatRoom(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorCreateChatRoom> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

