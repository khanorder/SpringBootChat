package com.zangho.chat.server.domain;

import com.zangho.chat.server.define.ChatType;
import lombok.Builder;
import lombok.Data;
import org.springframework.web.socket.WebSocketSession;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

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
