package com.zangho.chat.server.define;

import lombok.Getter;

@Getter
public enum ChatType {
    TALK(0),
    NOTICE(1);

    private final int number;
    ChatType(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }
}