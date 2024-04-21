package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorGetOthersUserInfo implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    NOT_FOUND_USER(2);

    private final int number;
    private ErrorGetOthersUserInfo(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

