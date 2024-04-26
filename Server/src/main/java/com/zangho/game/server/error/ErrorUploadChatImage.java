package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorUploadChatImage implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    ROOM_ID_REQUIRED(2),
    NOT_FOUND_ROOM(3),
    ONE_MORE_USERS_REQUIRED(4),
    NOT_ALLOWED_OPEN_TYPE(5),
    FAILED_TO_ADD(6);

    private final int number;

    ErrorUploadChatImage(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorUploadChatImage> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

