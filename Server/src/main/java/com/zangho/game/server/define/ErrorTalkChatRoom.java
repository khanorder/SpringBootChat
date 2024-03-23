package com.zangho.game.server.define;

import lombok.Getter;

@Getter
public enum ErrorTalkChatRoom {
    NONE(0),
    ROOM_REMOVED(1),
    NO_EXISTS_ROOM(2),
    NOT_IN_ROOM(3),
    NOT_FOUND_USER(4),
    NOT_AVAILABLE_CHAT_TYPE(5),
    FAILED_TO_SEND(6);

    private final int number;
    ErrorTalkChatRoom(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}

