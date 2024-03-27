package com.zangho.game.server.domain;

import lombok.Builder;
import lombok.Data;
import org.springframework.web.socket.WebSocketSession;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Data
public class ChatRoom {
    private String roomId;
    private String roomName;
    private Map<WebSocketSession, User> sessions = new ConcurrentHashMap<>();

    @Builder
    public ChatRoom(String roomId, String roomName) {
        this.roomId = roomId;
        this.roomName = roomName;
    }

    public ChatRoomInfo getInfo() {
        return new ChatRoomInfo(this.roomId, this.roomName);
    }

    public boolean checkUserInRoom(String userId) {
        return sessions.values().stream().anyMatch(user -> user.getId().equals(userId));
    }
}
