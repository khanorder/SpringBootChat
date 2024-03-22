package com.zangho.game.server.define;

public enum ErrorCreateChatRoom {
    NONE(0),
    EXISTS_ROOM(1),
    REQUIRED_ROOM_ID(2);

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

