package com.zangho.game.server.error;

public enum ErrorSubscribeChatRoom {
    NONE(0),
    REQUIRED_ROOM_ID(1),
    REQUIRED_USER_ID(2),
    NOT_FOUND_CHAT_ROOM(3),
    EMPTY_USER_IN_ROOM(4),
    NOT_FOUND_USER_IN_ROOM(5),
    ALREADY_SUBSCRIBE_ROOM(6);

    private final int number;
    private ErrorSubscribeChatRoom(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

