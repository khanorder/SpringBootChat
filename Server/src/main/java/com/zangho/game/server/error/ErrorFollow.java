package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorFollow implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    NOT_FOUND_USER(2),
    CAN_NOT_FOLLOW_SELF(3),
    ALREADY_FOLLOWED(4),
    FAILED_TO_FOLLOW(5);

    private final int number;
    private ErrorFollow(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

