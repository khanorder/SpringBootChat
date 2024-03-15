package com.zangho.chat.server.define;

import lombok.Getter;

@Getter
public enum PacketType {
    NONE(0),
    CREATE_CHAT_ROOM(1),
    UPDATE_CHAT_ROOM(2),
    ENTER_CHAT_ROOM(3),
    EXIT_CHAT_ROOM(4),
    NOTICE_ENTER_CHAT_ROOM(5),
    NOTICE_EXIT_CHAT_ROOM(6),
    NOTICE_CHAT_ROOM(7),
    TALK_CHAT_ROOM(8);

    private final int number;
    PacketType(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}