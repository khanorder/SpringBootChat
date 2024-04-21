package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorIssueJWT implements Types {
    NONE(0),
    FAILED_TO_ISSUE(1);

    private final int number;
    private ErrorIssueJWT(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

