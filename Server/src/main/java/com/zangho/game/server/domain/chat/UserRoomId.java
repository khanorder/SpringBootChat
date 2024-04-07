package com.zangho.game.server.domain.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRoomId implements Serializable {
    private String userId;
    private String roomId;
}