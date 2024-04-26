package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorExitChatRoom implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    ROOM_REMOVED(2),
    NO_EXISTS_ROOM(3),
    NOT_IN_ROOM(4),
    FAILED_TO_EXIT(5);

    private final int number;

    ErrorExitChatRoom(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorExitChatRoom> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

