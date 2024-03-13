package com.zangho.chat.server.define;

public enum PacketType {
    NONE(0),
    CREATE_CHAT_ROOM(1),
    UPDATE_CHAT_ROOM(2),
    ENTER_CHAT_ROOM(3),
    EXIT_CHAT_ROOM(4);

    private final int number;
    private PacketType(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}