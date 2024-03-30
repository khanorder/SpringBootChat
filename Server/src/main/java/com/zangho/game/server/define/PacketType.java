package com.zangho.game.server.define;

import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

@Getter
public enum PacketType {
    NONE(0),
    CHECK_CONNECTION(1),
    CHECK_AUTHENTICATION(2),
    CHANGE_USER_NAME(3),
    CREATE_CHAT_ROOM(11),
    ADD_CHAT_ROOM(12),
    REMOVE_CHAT_ROOM(13),
    UPDATE_PUBLIC_CHAT_ROOMS(14),
    ENTER_CHAT_ROOM(15),
    EXIT_CHAT_ROOM(16),
    UPDATE_CHAT_ROOM(17),
    NOTICE_ENTER_CHAT_ROOM(18),
    NOTICE_EXIT_CHAT_ROOM(19),
    NOTICE_CHANGE_NAME_CHAT_ROOM(20),
    NOTICE_CHAT_ROOM(21),
    TALK_CHAT_ROOM(22),
    HISTORY_CHAT_ROOM(23),
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