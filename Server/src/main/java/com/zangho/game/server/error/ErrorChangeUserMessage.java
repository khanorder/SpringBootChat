package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorChangeUserMessage implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    DATA_TOO_LONG(2),
    MESSAGE_REQUIRED(3),
    MESSAGE_TOO_SHORT(4),
    MESSAGE_TOO_LONG(5),
    FAILED_TO_CHANGE(6);

    private final int number;
    private ErrorChangeUserMessage(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

