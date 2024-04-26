package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorChangeUserMessage implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    DATA_TOO_LONG(2),
    MESSAGE_REQUIRED(3),
    MESSAGE_TOO_SHORT(4),
    MESSAGE_TOO_LONG(5),
    FAILED_TO_CHANGE(6);

    private final int number;

    ErrorChangeUserMessage(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorChangeUserMessage> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

