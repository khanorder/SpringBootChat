package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorGetTokenUserInfo implements Types {
    NONE(0),
    NOT_VALID_TOKEN(1),
    AUTH_EXPIRED(2),
    NOT_FOUND_USER(3);

    private final int number;

    ErrorGetTokenUserInfo(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorGetTokenUserInfo> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

