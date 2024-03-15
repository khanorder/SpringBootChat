package com.zangho.chat.server.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zangho.chat.server.domain.ChatRoom;
import org.springframework.web.socket.WebSocketSession;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class ChatService {

    private final Map<String, ChatRoom> chatRooms;

    public ChatService() {
        this.chatRooms = new ConcurrentHashMap<>();
    }

    public List<ChatRoom> findAllRoom() {
        return new ArrayList<>(chatRooms.values());
    }

    public Optional<ChatRoom> findRoomById(String roomId) {
        return Optional.ofNullable(chatRooms.get(roomId));
    }

    public Optional<ChatRoom> findRoomByName(String name) {
        return chatRooms.values().stream().filter(chatRoom -> chatRoom.getRoomName().equals(name)).findAny();
    }

    public ChatRoom createRoom(String name) {
        var randomId = UUID.randomUUID().toString();
        var chatRoom = ChatRoom.builder()
                .roomId(randomId)
                .roomName(name)
                .build();
        chatRooms.put(randomId, chatRoom);
        return chatRoom;
    }

    public boolean exitRoom(String roomId, WebSocketSession session) {
        var existsRoom = findRoomById(roomId);
        if (existsRoom.isEmpty())
            return false;

        if (existsRoom.get().getSessions().isEmpty()) {
            removeRoom(roomId);
            return false;
        }

        existsRoom.get().getSessions().remove(session);

        if (existsRoom.get().getSessions().isEmpty()) {
            removeRoom(roomId);
        }

        return true;
    }

    public void exitAllRooms(WebSocketSession session) {
        chatRooms.values().forEach(chatRoom -> exitRoom(chatRoom.getRoomId(), session));
    }

    public ChatRoom removeRoom(String roomId) {
        return chatRooms.remove(roomId);
    }

}
