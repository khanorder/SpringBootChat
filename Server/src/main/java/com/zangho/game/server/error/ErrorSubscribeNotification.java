package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorSubscribeNotification implements Types {
    NONE(0),
    REQUIRED_USER_ID(1),
    NOT_FOUND_USER(2),
    ALREADY_SUBSCRIBE(3),
    FAILED_SUBSCRIBE(4);

    private final int number;

    ErrorSubscribeNotification(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorSubscribeNotification> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

