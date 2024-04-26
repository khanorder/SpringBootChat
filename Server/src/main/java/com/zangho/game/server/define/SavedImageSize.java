package com.zangho.game.server.define;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

@Getter
public enum SavedImageSize implements Types {
    SMALL(0),
    LARGE(1);

    private final int number;
    SavedImageSize(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<SavedImageSize> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}