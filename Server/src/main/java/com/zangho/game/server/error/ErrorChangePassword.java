package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorChangePassword implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    PASSWORD_REQUIRED(2),
    NEW_PASSWORD_REQUIRED(3),
    NEW_PASSWORD_CONFIRM_REQUIRED(4),
    NEW_PASSWORD_NOT_MATCHED(5),
    NOT_FOUND_USER(6),
    PASSWORD_NOT_MATCHED(7),
    FAILED_TO_CHANGE(8);

    private final int number;

    ErrorChangePassword(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorChangePassword> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

