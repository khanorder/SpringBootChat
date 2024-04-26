package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorStartChat implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    NOT_FOUND_TARGET_USER(2),
    FAILED_TO_START_CHAT(3);

    private final int number;

    ErrorStartChat(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorStartChat> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

