package com.zangho.game.server.domain.chat;

import com.zangho.game.server.define.ChatType;
import lombok.Data;

@Data
public class Chat {
    String roomId;
    ChatType type;
    String chatId;
    int time;
    String userName;
    String message;

    public Chat(String roomId, ChatType type, String chatId, int time, String userName, String message) {
        this.roomId = roomId;
        this.type = type;
        this.chatId = chatId;
        this.time = time;
        this.userName = userName;
        this.message = message;
    }
}
