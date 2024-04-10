package com.zangho.game.server.define;

import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

@Getter
public enum ReqType implements Types {
    REQ_NONE(0),
    REQ_CHECK_CONNECTION(1),
    REQ_CHECK_AUTHENTICATION(2),
    REQ_CONNECTED_USERS(3),
    REQ_FOLLOW(4),
    REQ_UNFOLLOW(5),
    REQ_START_CHAT(6),
    REQ_CHANGE_USER_NAME(7),
    REQ_CREATE_CHAT_ROOM(8),
    REQ_ENTER_CHAT_ROOM(9),
    REQ_EXIT_CHAT_ROOM(10),
    REQ_TALK_CHAT_ROOM(11),
    REQ_TEST(255);

    private final int number;

    ReqType(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ReqType> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}