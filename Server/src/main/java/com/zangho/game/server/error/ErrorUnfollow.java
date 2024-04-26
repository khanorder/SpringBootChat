package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorUnfollow implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    NOT_FOUND_USER(2),
    CAN_NOT_UNFOLLOW_SELF(3),
    NOT_FOUND_FOLLOWED(4),
    FAILED_TO_UNFOLLOW(5);

    private final int number;

    ErrorUnfollow(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorUnfollow> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

