package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorRemoveUserProfile implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    NOT_HAVE_PROFILE(2),
    FAILED_TO_REMOVE(3);

    private final int number;
    private ErrorRemoveUserProfile(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

