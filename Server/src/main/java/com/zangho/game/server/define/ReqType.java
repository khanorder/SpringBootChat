package com.zangho.game.server.define;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

@Getter
public enum ReqType implements Types {
    REQ_NONE(0),
    REQ_CHECK_CONNECTION(1),
    REQ_CHECK_AUTHENTICATION(2),
    REQ_SIGN_IN(3),
    REQ_SIGN_OUT(4),
    REQ_CHECK_NOTIFICATION(5),
    REQ_REMOVE_NOTIFICATION(6),
    REQ_CONNECTED_USERS(7),
    REQ_GET_TOKEN_USER_INFO(8),
    REQ_GET_OTHERS_USER_INFO(9),
    REQ_FOLLOW(10),
    REQ_UNFOLLOW(11),
    REQ_START_CHAT(12),
    REQ_CHANGE_USER_NAME(13),
    REQ_CHANGE_USER_MESSAGE(14),
    REQ_CHANGE_USER_PROFILE(15),
    REQ_REMOVE_USER_PROFILE(16),
    REQ_CREATE_CHAT_ROOM(17),
    REQ_ADD_USER_CHAT_ROOM(18),
    REQ_REMOVE_CHAT_ROOM(19),
    REQ_ENTER_CHAT_ROOM(20),
    REQ_EXIT_CHAT_ROOM(21),
    REQ_TALK_CHAT_ROOM(22),
    REQ_HISTORY_CHAT_ROOM(23),
    REQ_TEST(255);

    private final int number;

    ReqType(int number) {
        this.number = number;
    }

    @JsonValue
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