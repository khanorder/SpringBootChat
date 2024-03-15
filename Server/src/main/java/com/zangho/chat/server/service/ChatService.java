package com.zangho.chat.server.service;

import com.zangho.chat.server.domain.ChatRoom;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.WebSocketSession;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class ChatService {

    private final Logger logger = LoggerFactory.getLogger(ChatService.class);
    private final Map<String, ChatRoom> chatRooms;

    public ChatService() {
        this.chatRooms = new ConcurrentHashMap<>();
    }

    public List<ChatRoom> findAllRoom() throws Exception {
        return new ArrayList<>(chatRooms.values());
    }

    public Optional<ChatRoom> findRoomById(String roomId) throws Exception {
        return Optional.ofNullable(chatRooms.get(roomId));
    }

    public Optional<ChatRoom> findRoomByName(String name) throws Exception {
        return chatRooms.values().stream().filter(chatRoom -> chatRoom.getRoomName().equals(name)).findAny();
    }

    public ChatRoom createRoom(String name) throws Exception {
        var randomId = UUID.randomUUID().toString();
        var chatRoom = ChatRoom.builder()
                .roomId(randomId)
                .roomName(name)
                .build();
        chatRooms.put(randomId, chatRoom);
        return chatRoom;
    }

    public boolean exitRoom(String roomId, WebSocketSession session) throws Exception {
        var existsRoom = findRoomById(roomId);
        if (existsRoom.isEmpty())
            return false;

        if (existsRoom.get().getSessions().isEmpty()) {
            removeRoom(roomId);
            return false;
        }

        if (!existsRoom.get().getSessions().containsKey(session)) {
            return false;
        }

        existsRoom.get().getSessions().remove(session);

        if (existsRoom.get().getSessions().isEmpty()) {
            removeRoom(roomId);
        }

        return true;
    }

    public void removeRoom(String roomId) throws Exception {
        chatRooms.remove(roomId);
    }

}
