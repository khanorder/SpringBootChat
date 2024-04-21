package com.zangho.game.server.define;

import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

@Getter
public enum ResType implements Types {
    RES_NONE(0),
    RES_CHECK_CONNECTION(1),
    RES_CHECK_AUTHENTICATION(2),
    RES_SIGN_OUT(3),
    RES_DEMAND_REFRESH_TOKEN(4),
    RES_TOKEN_EXPIRED(5),
    RES_NOTIFICATION(6),
    RES_NOTIFICATIONS_START_CHAT(7),
    RES_NOTIFICATIONS_FOLLOWER(8),
    RES_CHECK_NOTIFICATION(9),
    RES_REMOVE_NOTIFICATION(10),
    RES_LATEST_ACTIVE_USERS(11),
    RES_CONNECTED_USERS(12),
    RES_NOTICE_CONNECTED_USER(13),
    RES_NOTICE_DISCONNECTED_USER(14),
    RES_GET_TOKEN_USER_INFO(15),
    RES_GET_OTHERS_USER_INFO(16),
    RES_FOLLOWS(17),
    RES_FOLLOWERS(18),
    RES_CHAT_ROOMS(19),
    RES_FOLLOW(20),
    RES_UNFOLLOW(21),
    RES_FOLLOWER(22),
    RES_UNFOLLOWER(23),
    RES_START_CHAT(24),
    RES_OPEN_PREPARED_CHAT_ROOM(25),
    RES_CHANGE_USER_NAME(26),
    RES_NOTICE_USER_NAME_CHANGED(27),
    RES_CHANGE_USER_MESSAGE(28),
    RES_NOTICE_USER_MESSAGE_CHANGED(29),
    RES_CHANGE_USER_PROFILE(30),
    RES_NOTICE_USER_PROFILE_CHANGED(31),
    RES_REMOVE_USER_PROFILE(32),
    RES_NOTICE_USER_PROFILE_REMOVED(33),
    RES_CREATE_CHAT_ROOM(34),
    RES_ADD_USER_CHAT_ROOM(35),
    RES_ADD_CHAT_ROOM(36),
    RES_REMOVE_CHAT_ROOM(37),
    RES_ENTER_CHAT_ROOM(38),
    RES_EXIT_CHAT_ROOM(39),
    RES_UPDATE_CHAT_ROOM(40),
    RES_NOTICE_ADD_CHAT_ROOM_USER(41),
    RES_NOTICE_REMOVE_CHAT_ROOM_USER(42),
    RES_NOTICE_ENTER_CHAT_ROOM(43),
    RES_NOTICE_EXIT_CHAT_ROOM(44),
    RES_NOTICE_CHANGE_NAME_CHAT_ROOM(45),
    RES_NOTICE_CHAT_ROOM(46),
    RES_TALK_CHAT_ROOM(47),
    RES_HISTORY_CHAT_ROOM(48),
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