package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorGetTokenUserInfo implements Types {
    NONE(0),
    NOT_VALID_TOKEN(1),
    AUTH_EXPIRED(2),
    NOT_FOUND_USER(3);

    private final int number;
    private ErrorGetTokenUserInfo(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

