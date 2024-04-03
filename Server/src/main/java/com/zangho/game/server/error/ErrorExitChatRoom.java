package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorExitChatRoom implements Types {
    NONE(0),
    NOT_FOUND_USER(1),
    ROOM_REMOVED(2),
    NO_EXISTS_ROOM(3),
    NOT_IN_ROOM(4),
    FAILED_TO_EXIT(5);

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

