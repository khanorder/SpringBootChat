package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorCheckAuth implements Types {
    NONE(0),
    NOT_VALID_TOKEN(1),
    TOKEN_IS_EMPTY(2),
    AUTH_EXPIRED(3),
    ALREADY_SIGN_IN_USER(4),
    FAILED_TO_CREATE_USER(5),
    FAILED_TO_ISSUE_TOKEN(6),
    FAILED_TO_AUTH(7);

    private final int number;

    ErrorCheckAuth(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorCheckAuth> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

