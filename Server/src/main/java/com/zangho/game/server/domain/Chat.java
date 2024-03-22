package com.zangho.game.server.domain;

import com.zangho.game.server.define.ChatType;
import lombok.Data;

@Data
public class Chat {
    String roomId;
    ChatType type;
    String id;
    int time;
    String userName;
    String message;

    public Chat(String roomId, ChatType type, String id, int time, String userName, String message) {
        this.roomId = roomId;
        this.type = type;
        this.id = id;
        this.time = time;
        this.userName = userName;
        this.message = message;
    }
}
