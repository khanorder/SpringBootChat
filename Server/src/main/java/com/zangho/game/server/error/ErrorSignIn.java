package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorSignIn implements Types {
    NONE(0),
    USER_NAME_REQUIRED(1),
    PASSWORD_REQUIRED(2),
    ALREADY_SIGN_IN(3),
    FAILED_TO_SIGN_IN(4);

    private final int number;

    ErrorSignIn(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorSignIn> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

