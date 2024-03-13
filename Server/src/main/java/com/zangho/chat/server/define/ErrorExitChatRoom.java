package com.zangho.chat.server.define;

public enum ErrorExitChatRoom {
    NONE(0),
    ROOM_REMOVED(1),
    NO_EXISTS_ROOM(2),
    NOT_IN_ROOM(3),
    FAILED_TO_EXIT(4);

    private final int number;
    private ErrorExitChatRoom(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

