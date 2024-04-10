package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorCheckConnection implements Types {
    NONE(0),
    UPDATE_REQUIRED(1);

    private final int number;
    private ErrorCheckConnection(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

