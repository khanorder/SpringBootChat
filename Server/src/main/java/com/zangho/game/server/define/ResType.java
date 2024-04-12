package com.zangho.game.server.define;

import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

@Getter
public enum ResType implements Types {
    RES_NONE(0),
    RES_CHECK_CONNECTION(1),
    RES_CHECK_AUTHENTICATION(2),
    RES_NOTIFICATION(3),
    RES_CONNECTED_USERS(4),
    RES_NOTICE_CONNECTED_USER(5),
    RES_NOTICE_DISCONNECTED_USER(6),
    RES_FOLLOWS(7),
    RES_FOLLOWERS(8),
    RES_CHAT_ROOMS(9),
    RES_FOLLOW(10),
    RES_UNFOLLOW(11),
    RES_FOLLOWER(12),
    RES_UNFOLLOWER(13),
    RES_START_CHAT(14),
    RES_CHANGE_USER_NAME(15),
    RES_CREATE_CHAT_ROOM(16),
    RES_ADD_CHAT_ROOM(17),
    RES_REMOVE_CHAT_ROOM(18),
    RES_ENTER_CHAT_ROOM(19),
    RES_EXIT_CHAT_ROOM(20),
    RES_UPDATE_CHAT_ROOM(21),
    RES_NOTICE_ENTER_CHAT_ROOM(22),
    RES_NOTICE_EXIT_CHAT_ROOM(23),
    RES_NOTICE_CHANGE_NAME_CHAT_ROOM(24),
    RES_NOTICE_CHAT_ROOM(25),
    RES_TALK_CHAT_ROOM(26),
    RES_HISTORY_CHAT_ROOM(27),
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