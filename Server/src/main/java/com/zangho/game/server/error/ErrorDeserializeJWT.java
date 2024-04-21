package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorDeserializeJWT implements Types {
    NONE(0),
    INVALID_TOKEN_TYPE(1),
    TOKEN_EXPIRED(2),
    NOT_FOUND_TOKEN_ID(3),
    NOT_FOUND_USER_ID(4),
    NOT_FOUND_USER_ACCOUNT_TYPE(5),
    DISPOSED_TOKEN(6),
    FAILED_TO_DESERIALIZE(7);


    private final int number;
    private ErrorDeserializeJWT(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

