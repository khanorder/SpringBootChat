package com.zangho.game.server.define;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

@Getter
public enum ResType implements Types {
    RES_NONE(0),
    RES_CHECK_CONNECTION(1),
    RES_CHECK_AUTHENTICATION(2),
    RES_SIGN_IN(3),
    RES_SIGN_OUT(4),
    RES_DEMAND_REFRESH_TOKEN(5),
    RES_ACCESS_TOKEN_EXPIRED(6),
    RES_REFRESH_TOKEN_EXPIRED(7),
    RES_NOTIFICATION(8),
    RES_NOTIFICATIONS_START_CHAT(9),
    RES_NOTIFICATIONS_FOLLOWER(10),
    RES_CHECK_NOTIFICATION(11),
    RES_REMOVE_NOTIFICATION(12),
    RES_LATEST_ACTIVE_USERS(13),
    RES_CONNECTED_USERS(14),
    RES_NOTICE_CONNECTED_USER(15),
    RES_NOTICE_DISCONNECTED_USER(16),
    RES_GET_TOKEN_USER_INFO(17),
    RES_GET_OTHERS_USER_INFO(18),
    RES_FOLLOWS(19),
    RES_FOLLOWERS(20),
    RES_CHAT_ROOMS(21),
    RES_FOLLOW(22),
    RES_UNFOLLOW(23),
    RES_FOLLOWER(24),
    RES_UNFOLLOWER(25),
    RES_START_CHAT(26),
    RES_OPEN_PREPARED_CHAT_ROOM(27),
    RES_CHANGE_NICK_NAME(28),
    RES_NOTICE_NICK_NAME_CHANGED(29),
    RES_CHANGE_USER_MESSAGE(30),
    RES_NOTICE_USER_MESSAGE_CHANGED(31),
    RES_CHANGE_USER_PROFILE(32),
    RES_NOTICE_USER_PROFILE_CHANGED(33),
    RES_REMOVE_USER_PROFILE(34),
    RES_NOTICE_USER_PROFILE_REMOVED(35),
    RES_CREATE_CHAT_ROOM(36),
    RES_ADD_USER_CHAT_ROOM(37),
    RES_ADD_CHAT_ROOM(38),
    RES_REMOVE_CHAT_ROOM(39),
    RES_ENTER_CHAT_ROOM(40),
    RES_EXIT_CHAT_ROOM(41),
    RES_UPDATE_CHAT_ROOM(42),
    RES_NOTICE_ADD_CHAT_ROOM_USER(43),
    RES_NOTICE_REMOVE_CHAT_ROOM_USER(44),
    RES_NOTICE_ENTER_CHAT_ROOM(45),
    RES_NOTICE_EXIT_CHAT_ROOM(46),
    RES_NOTICE_CHANGE_NICK_NAME_CHAT_ROOM(47),
    RES_NOTICE_CHAT_ROOM(48),
    RES_TALK_CHAT_ROOM(49),
    RES_HISTORY_CHAT_ROOM(50),
    RES_TEST(255);

    private final int number;

    ResType(int number) {
        this.number = number;
    }

    @JsonValue
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