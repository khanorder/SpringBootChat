package com.zangho.game.server.define;

public enum ErrorCreateChatRoom {
    NONE(0),
    NOT_FOUND_USER(1),
    EXISTS_ROOM(2),
    REQUIRED_ROOM_ID(3);

    private final int number;
    private ErrorCreateChatRoom(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

