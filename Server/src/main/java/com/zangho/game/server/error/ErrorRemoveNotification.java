package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorRemoveNotification implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    ID_REQUIRED(2),
    NOT_FOUND_NOTIFICATION(3),
    FAILED_TO_REMOVE(4);

    private final int number;

    ErrorRemoveNotification(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorRemoveNotification> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

