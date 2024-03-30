package com.zangho.game.server.error;

public enum ErrorCreateChatRoom {
    NONE(0),
    NOT_ALLOWED_OPEN_TYPE(1),
    NOT_FOUND_USER(2),
    EXISTS_ROOM(3),
    REQUIRED_ROOM_ID(4);

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

