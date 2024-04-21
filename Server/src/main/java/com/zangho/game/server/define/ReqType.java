package com.zangho.game.server.define;

import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

@Getter
public enum ReqType implements Types {
    REQ_NONE(0),
    REQ_CHECK_CONNECTION(1),
    REQ_CHECK_AUTHENTICATION(2),
    REQ_SIGN_OUT(3),
    REQ_CHECK_NOTIFICATION(4),
    REQ_REMOVE_NOTIFICATION(5),
    REQ_CONNECTED_USERS(6),
    REQ_GET_TOKEN_USER_INFO(7),
    REQ_GET_OTHERS_USER_INFO(8),
    REQ_FOLLOW(9),
    REQ_UNFOLLOW(10),
    REQ_START_CHAT(11),
    REQ_CHANGE_USER_NAME(12),
    REQ_CHANGE_USER_MESSAGE(13),
    REQ_CHANGE_USER_PROFILE(14),
    REQ_REMOVE_USER_PROFILE(15),
    REQ_CREATE_CHAT_ROOM(16),
    REQ_ADD_USER_CHAT_ROOM(17),
    REQ_REMOVE_CHAT_ROOM(18),
    REQ_ENTER_CHAT_ROOM(19),
    REQ_EXIT_CHAT_ROOM(20),
    REQ_TALK_CHAT_ROOM(21),
    REQ_HISTORY_CHAT_ROOM(22),
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