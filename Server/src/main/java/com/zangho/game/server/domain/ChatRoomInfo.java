package com.zangho.game.server.domain;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatRoomInfo {
    private String roomId;
    private String roomName;
}
