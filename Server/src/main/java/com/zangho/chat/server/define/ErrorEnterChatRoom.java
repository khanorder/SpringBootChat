package com.zangho.chat.server.define;

import lombok.Getter;

@Getter
public enum ErrorEnterChatRoom {
    NONE(0),
    ROOM_REMOVED(1),
    NO_EXISTS_ROOM(2),
    ALREADY_IN_ROOM(3),
    FAILED_TO_ENTER(4);

    private final int number;
    ErrorEnterChatRoom(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

