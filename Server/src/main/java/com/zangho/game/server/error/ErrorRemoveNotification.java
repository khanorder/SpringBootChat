package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorRemoveNotification implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    ID_REQUIRED(2),
    NOT_FOUND_NOTIFICATION(3),
    FAILED_TO_REMOVE(4);

    private final int number;
    private ErrorRemoveNotification(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

