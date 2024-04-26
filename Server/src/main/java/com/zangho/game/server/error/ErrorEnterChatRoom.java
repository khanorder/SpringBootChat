package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;
import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

@Getter
public enum ErrorEnterChatRoom implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    ROOM_REMOVED(2),
    NO_EXISTS_ROOM(3),
    NOT_MATCHED_USER(4),
    ALREADY_IN_ROOM(5),
    NOT_AVAILABLE_ROOM(6),
    FAILED_TO_ENTER(7);

    private final int number;

    ErrorEnterChatRoom(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorEnterChatRoom> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

