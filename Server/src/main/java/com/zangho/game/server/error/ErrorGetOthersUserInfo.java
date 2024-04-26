package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorGetOthersUserInfo implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    NOT_FOUND_USER(2);

    private final int number;

    ErrorGetOthersUserInfo(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorGetOthersUserInfo> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

