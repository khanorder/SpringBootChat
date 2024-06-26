package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;
import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

@Getter
public enum ErrorTalkChatRoom implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    ROOM_REMOVED(2),
    NO_EXISTS_ROOM(3),
    NOT_IN_ROOM(4),
    NOT_MATCHED_USER(5),
    NOT_AVAILABLE_CHAT_TYPE(6),
    FAILED_TO_SEND(7);

    private final int number;

    ErrorTalkChatRoom(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorTalkChatRoom> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

