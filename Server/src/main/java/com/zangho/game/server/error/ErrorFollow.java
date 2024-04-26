package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorFollow implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    NOT_FOUND_USER(2),
    CAN_NOT_FOLLOW_SELF(3),
    ALREADY_FOLLOWED(4),
    FAILED_TO_FOLLOW(5);

    private final int number;

    ErrorFollow(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorFollow> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

