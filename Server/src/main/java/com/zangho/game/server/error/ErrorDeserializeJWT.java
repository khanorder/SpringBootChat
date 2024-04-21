package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorDeserializeJWT implements Types {
    NONE(0),
    TOKEN_TYPE_IS_EMPTY(1),
    INVALID_TOKEN_TYPE(2),
    TOKEN_EXPIRED(3),
    NOT_FOUND_TOKEN_ID(4),
    USER_ID_IS_EMPTY(5),
    NOT_FOUND_USER_ID(6),
    USER_ACCOUNT_TYPE_IS_EMPTY(7),
    NOT_FOUND_USER_ACCOUNT_TYPE(8),
    DISPOSED_TOKEN(9),
    FAILED_TO_DESERIALIZE(10);


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

