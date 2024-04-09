package com.zangho.game.server.define;

import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

@Getter
public enum ResType implements Types {
    RES_NONE(0),
    RES_CHECK_CONNECTION(1),
    RES_CHECK_AUTHENTICATION(2),
    RES_CONNECTED_USERS(3),
    RES_NOTICE_CONNECTED_USER(4),
    RES_NOTICE_DISCONNECTED_USER(5),
    RES_FOLLOW(6),
    RES_UNFOLLOW(7),
    RES_FOLLOWER(8),
    RES_UNFOLLOWER(9),
    RES_CHANGE_USER_NAME(10),
    RES_CREATE_CHAT_ROOM(11),
    RES_ADD_CHAT_ROOM(12),
    RES_REMOVE_CHAT_ROOM(13),
    RES_UPDATE_CHAT_ROOMS(14),
    RES_ENTER_CHAT_ROOM(15),
    RES_EXIT_CHAT_ROOM(16),
    RES_UPDATE_CHAT_ROOM(17),
    RES_NOTICE_ENTER_CHAT_ROOM(18),
    RES_NOTICE_EXIT_CHAT_ROOM(19),
    RES_NOTICE_CHANGE_NAME_CHAT_ROOM(20),
    RES_NOTICE_CHAT_ROOM(21),
    RES_TALK_CHAT_ROOM(22),
    RES_HISTORY_CHAT_ROOM(23),
    RES_TEST(255);

    private final int number;

    ResType(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ResType> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}