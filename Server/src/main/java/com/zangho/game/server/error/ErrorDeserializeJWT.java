package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorDeserializeJWT implements Types {
    NONE(0),
    NOT_FOUND_TOKEN_ID(1),
    TOKEN_EXPIRED(2),
    FAILED_TO_DESERIALIZE(3);


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

