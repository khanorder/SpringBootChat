package com.zangho.game.server.define;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

import java.util.Arrays;
import java.util.Optional;

@Getter
public enum InvitationState implements Types {
    NONE(0),
    ALLOW(1),
    DISALLOW(2);

    private final int number;

    InvitationState(int number) {
        this.number = number;
    }

    @JsonValue
    public int getNumber() {
        return number;
    }

    public byte getByte() {
        return (byte)number;
    }

    public static Optional<InvitationState> getType(int number) {
        return Arrays.stream(values()).filter(no -> no.number == number).findFirst();
    }
}