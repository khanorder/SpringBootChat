package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorRemoveChatRoom implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    REQUIRED_ROOM_ID(2),
    NOT_FOUND_CHAT_ROOM(3),
    NOT_ALLOWED_OPEN_TYPE(4),
    NOT_IN_ROOM(5),
    FAILED_TO_REMOVE(6);

    private final int number;
    private ErrorRemoveChatRoom(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

