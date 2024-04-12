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
    RES_CHECK_NOTIFICATION(4),
    RES_REMOVE_NOTIFICATION(5),
    RES_CONNECTED_USERS(6),
    RES_NOTICE_CONNECTED_USER(7),
    RES_NOTICE_DISCONNECTED_USER(8),
    RES_FOLLOWS(9),
    RES_FOLLOWERS(10),
    RES_CHAT_ROOMS(11),
    RES_FOLLOW(12),
    RES_UNFOLLOW(13),
    RES_FOLLOWER(14),
    RES_UNFOLLOWER(15),
    RES_START_CHAT(16),
    RES_CHANGE_USER_NAME(17),
    RES_NOTICE_USER_NAME_CHANGED(18),
    RES_CHANGE_USER_MESSAGE(19),
    RES_NOTICE_USER_MESSAGE_CHANGED(20),
    RES_CHANGE_USER_PROFILE(21),
    RES_NOTICE_USER_PROFILE_CHANGED(22),
    RES_CREATE_CHAT_ROOM(23),
    RES_ADD_CHAT_ROOM(24),
    RES_REMOVE_CHAT_ROOM(25),
    RES_ENTER_CHAT_ROOM(26),
    RES_EXIT_CHAT_ROOM(27),
    RES_UPDATE_CHAT_ROOM(28),
    RES_NOTICE_ENTER_CHAT_ROOM(29),
    RES_NOTICE_EXIT_CHAT_ROOM(30),
    RES_NOTICE_CHANGE_NAME_CHAT_ROOM(31),
    RES_NOTICE_CHAT_ROOM(32),
    RES_TALK_CHAT_ROOM(33),
    RES_HISTORY_CHAT_ROOM(34),
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