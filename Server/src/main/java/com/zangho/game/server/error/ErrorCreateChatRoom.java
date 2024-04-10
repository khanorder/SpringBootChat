package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;

public enum ErrorCreateChatRoom implements Types {
    NONE(0),
    NOT_ALLOWED_OPEN_TYPE(1),
    NOT_FOUND_USER(2),
    NOT_MATCHED_USER(3),
    EXISTS_ROOM(4),
    FAILED_TO_CREATE_CHAT_ROOM(5),
    REQUIRED_ROOM_ID(6);

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

