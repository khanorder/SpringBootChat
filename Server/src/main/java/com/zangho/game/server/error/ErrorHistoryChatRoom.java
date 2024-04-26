package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;
import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

@Getter
public enum ErrorHistoryChatRoom implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    ROOM_REMOVED(2),
    NO_EXISTS_ROOM(3),
    NOT_MATCHED_USER(4),
    NOT_AVAILABLE_ROOM(5),
    FAILED_TO_GET_HISTORY(6);

    private final int number;

    ErrorHistoryChatRoom(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorHistoryChatRoom> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

