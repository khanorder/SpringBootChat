package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorVerifyJWT implements Types {
    NONE(0),
    TOKEN_IS_EMPTY(1),
    TOKEN_TYPE_IS_EMPTY(2),
    INVALID_TOKEN_TYPE(3),
    TOKEN_EXPIRED(4),
    NOT_FOUND_TOKEN_ID(5),
    USER_ID_IS_EMPTY(6),
    NOT_FOUND_USER_ID(7),
    USER_ACCOUNT_TYPE_IS_EMPTY(8),
    NOT_FOUND_USER_ACCOUNT_TYPE(9),
    DISPOSED_TOKEN(10),
    FAILED_TO_DECODE(11);

    private final int number;

    ErrorVerifyJWT(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorVerifyJWT> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

