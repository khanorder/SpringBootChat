package com.zangho.game.server.define;

import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

@Getter
public enum RoomOpenType implements Types {
    PRIVATE(0),
    PUBLIC(1),
    FRIEND(2);

    private final int number;

    RoomOpenType(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<RoomOpenType> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}