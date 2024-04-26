package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorSignOut implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    NOT_VALID_TOKEN(2),
    AUTH_EXPIRED(3),
    ID_REQUIRED(4),
    NOT_FOUND_USER(5),
    FAILED_TO_SIGN_OUT(6);

    private final int number;

    ErrorSignOut(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorSignOut> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

