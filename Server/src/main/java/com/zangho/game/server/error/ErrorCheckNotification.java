package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorCheckNotification implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    ID_REQUIRED(2),
    NOT_FOUND_NOTIFICATION(3),
    ALREADY_CHECKED(4),
    FAILED_TO_CHECK(5);

    private final int number;
    private ErrorCheckNotification(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

