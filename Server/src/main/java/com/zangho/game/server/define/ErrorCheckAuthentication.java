package com.zangho.game.server.define;

public enum ErrorCheckAuthentication {
    NONE(0),
    ALREADY_SIGN_IN_USER(1),
    FAILED_TO_CREATE_USER(2);

    private final int number;
    private ErrorCheckAuthentication(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

