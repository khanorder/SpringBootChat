package com.zangho.game.server.define;

import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

@Getter
public enum PacketType {
    NONE(0),
    CHECK_CONNECTION(1),
    CREATE_CHAT_ROOM(11),
    UPDATE_CHAT_ROOMS(12),
    ENTER_CHAT_ROOM(13),
    EXIT_CHAT_ROOM(14),
    UPDATE_CHAT_ROOM(15),
    NOTICE_ENTER_CHAT_ROOM(16),
    NOTICE_EXIT_CHAT_ROOM(17),
    NOTICE_CHAT_ROOM(18),
    TALK_CHAT_ROOM(19),
    TEST(255);

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

    public static Optional<PacketType> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}