package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorCheckAuth implements Types {
    NONE(0),
    NOT_VALID_TOKEN(1),
    AUTH_EXPIRED(2),
    ALREADY_SIGN_IN_USER(3),
    FAILED_TO_CREATE_USER(4),
    FAILED_TO_ISSUE_TOKEN(5);

    private final int number;
    private ErrorCheckAuth(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

