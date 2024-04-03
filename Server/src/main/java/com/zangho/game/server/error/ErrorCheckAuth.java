package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorCheckAuth implements Types {
    NONE(0),
    ALREADY_SIGN_IN_USER(1),
    FAILED_TO_CREATE_USER(2);

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

