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
    RES_NOTIFICATIONS_START_CHAT(4),
    RES_NOTIFICATIONS_FOLLOWER(5),
    RES_CHECK_NOTIFICATION(6),
    RES_REMOVE_NOTIFICATION(7),
    RES_LATEST_ACTIVE_USERS(8),
    RES_CONNECTED_USERS(9),
    RES_NOTICE_CONNECTED_USER(10),
    RES_NOTICE_DISCONNECTED_USER(11),
    RES_GET_USER_INFO(12),
    RES_FOLLOWS(13),
    RES_FOLLOWERS(14),
    RES_CHAT_ROOMS(15),
    RES_FOLLOW(16),
    RES_UNFOLLOW(17),
    RES_FOLLOWER(18),
    RES_UNFOLLOWER(19),
    RES_START_CHAT(20),
    RES_OPEN_PREPARED_CHAT_ROOM(21),
    RES_CHANGE_USER_NAME(22),
    RES_NOTICE_USER_NAME_CHANGED(23),
    RES_CHANGE_USER_MESSAGE(24),
    RES_NOTICE_USER_MESSAGE_CHANGED(25),
    RES_CHANGE_USER_PROFILE(26),
    RES_NOTICE_USER_PROFILE_CHANGED(27),
    RES_REMOVE_USER_PROFILE(28),
    RES_NOTICE_USER_PROFILE_REMOVED(29),
    RES_CREATE_CHAT_ROOM(30),
    RES_ADD_CHAT_ROOM(31),
    RES_REMOVE_CHAT_ROOM(32),
    RES_ENTER_CHAT_ROOM(33),
    RES_EXIT_CHAT_ROOM(34),
    RES_UPDATE_CHAT_ROOM(35),
    RES_NOTICE_ADD_CHAT_ROOM_USER(36),
    RES_NOTICE_REMOVE_CHAT_ROOM_USER(37),
    RES_NOTICE_ENTER_CHAT_ROOM(38),
    RES_NOTICE_EXIT_CHAT_ROOM(39),
    RES_NOTICE_CHANGE_NAME_CHAT_ROOM(40),
    RES_NOTICE_CHAT_ROOM(41),
    RES_TALK_CHAT_ROOM(42),
    RES_HISTORY_CHAT_ROOM(43),
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