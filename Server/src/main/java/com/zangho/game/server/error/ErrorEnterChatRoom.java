package com.zangho.game.server.error;

import com.zangho.game.server.define.Types;
import lombok.Getter;

@Getter
public enum ErrorEnterChatRoom implements Types {
    NONE(0),
    ROOM_REMOVED(1),
    NO_EXISTS_ROOM(2),
    NOT_FOUND_USER(3),
    NOT_MATCHED_USER(4),
    ALREADY_IN_ROOM(5),
    FAILED_TO_ENTER(6);

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

