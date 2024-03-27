package com.zangho.game.server.define;

import lombok.Getter;

@Getter
public enum ErrorEnterChatRoom {
    NONE(0),
    ROOM_REMOVED(1),
    NO_EXISTS_ROOM(2),
    NOT_FOUND_USER(3),
    ALREADY_IN_ROOM(4),
    FAILED_TO_ENTER(5);

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

