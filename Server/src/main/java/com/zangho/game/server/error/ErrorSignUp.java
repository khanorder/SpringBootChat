package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorSignUp implements Types {
    NONE(0),
    UPGRADE_EXISTS_ACCOUNT(1),
    USER_NAME_REQUIRED(2),
    USER_NAME_MORE_THAN_TWO(3),
    ALREADY_USED_USER_NAME(4),
    PASSWORD_REQUIRED(5),
    PASSWORD_MORE_THAN_FOUR(6),
    NOT_SUITABLE_PASSWORD(7),
    NOT_VALID_ACCESS_TOKEN(8),
    NOT_VALID_TOKEN_USER(9),
    NOT_VALID_ACCOUNT_TYPE(10),
    NOT_FOUND_TEMP_USER(11),
    FAILED_TO_ISSUE_TOKEN(12),
    FAILED_TO_SIGN_UP(13);

    private final int number;

    ErrorSignUp(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorSignUp> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

