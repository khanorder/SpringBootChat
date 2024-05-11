package com.zangho.game.server.error;

import com.fasterxml.jackson.annotation.JsonValue;
import com.zangho.game.server.define.Types;

import java.util.Arrays;
import java.util.Optional;

public enum ErrorDownloadChatImage implements Types {
    NONE(0),
    AUTH_REQUIRED(1),
    ID_REQUIRED(2),
    NOT_FOUND_DATA(3),
    NOT_FOUND_FILE(4),
    FAILED_TO_DOWNLOAD(5);

    private final int number;

    ErrorDownloadChatImage(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<ErrorDownloadChatImage> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}

