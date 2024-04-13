package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorChangeUserName implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    DATA_TOO_LONG(2),
    NAME_REQUIRED(3),
    NAME_TOO_SHORT(4),
    NAME_TOO_LONG(5),
    FAILED_TO_CHANGE(6);

    private final int number;
    private ErrorChangeUserName(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

