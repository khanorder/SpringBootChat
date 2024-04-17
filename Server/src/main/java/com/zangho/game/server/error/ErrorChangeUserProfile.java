package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorChangeUserProfile implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    DATA_TOO_LONG(2),
    NOT_SUITABLE_DATA(3),
    NOT_ALLOWED_FIlE_TYPE(4),
    SMALL_IMAGE_REQUIRED(5),
    LARGE_IMAGE_REQUIRED(6),
    SMALL_IMAGE_BYTES_TOO_LONG(7),
    LARGE_IMAGE_BYTES_TOO_LONG(8),
    FAILED_TO_CHANGE(9);

    private final int number;
    private ErrorChangeUserProfile(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

