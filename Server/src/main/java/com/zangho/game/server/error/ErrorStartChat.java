package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorStartChat implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    NOT_FOUND_TARGET_USER(2),
    FAILED_TO_START_CHAT(3);

    private final int number;
    private ErrorStartChat(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

