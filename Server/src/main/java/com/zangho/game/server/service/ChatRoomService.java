package com.zangho.game.server.service;

import com.zangho.game.server.define.RoomOpenType;
import com.zangho.game.server.domain.chat.Chat;
import com.zangho.game.server.domain.chat.ChatRoom;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.error.ErrorExitChatRoom;
import com.zangho.game.server.repository.chat.ChatRepository;
import com.zangho.game.server.repository.chat.ChatRoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.WebSocketSession;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicReference;

public class ChatRoomService {

    private final Logger logger = LoggerFactory.getLogger(ChatRoomService.class);
    private final ChatRoomRepository chatRoomRepository;
    private final ChatRepository chatRepository;
    private final ConcurrentHashMap<String, ChatRoom> publicChatRooms;
    private final ConcurrentHashMap<String, ChatRoom> privateChatRooms;

    public ChatRoomService(ChatRoomRepository chatRoomRepository, ChatRepository chatRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatRepository = chatRepository;
        this.publicChatRooms = new ConcurrentHashMap<>();
        this.privateChatRooms = new ConcurrentHashMap<>();
    }

    public List<ChatRoom> findAllPublicChatRooms() throws Exception {
        return new ArrayList<>(publicChatRooms.values());
    }

    public List<ChatRoom> findAllPrivateChatRooms() throws Exception {
        return new ArrayList<>(privateChatRooms.values());
    }

    public List<ChatRoom> findAllPrivateChatRoomsByUserId(String userId) throws Exception {
        return new ArrayList<>(privateChatRooms.values().stream().filter(chatRoom -> chatRoom.getSessions().values().stream().anyMatch(userRoom -> userRoom.getUserId().equals(userId))).toList());
    }

    public Optional<ChatRoom> findPublicRoomById(String roomId) throws Exception {
        AtomicReference<ChatRoom> chatRoom = new AtomicReference<>(publicChatRooms.get(roomId));
        if (null == chatRoom.get()) {
            var dbChatRoom = chatRoomRepository.findByRoomIdAndOpenType(roomId, RoomOpenType.PUBLIC);
            if (dbChatRoom.isPresent()) {
                var dbChat = chatRepository.findByRoomIdLatest(roomId);
                if (!dbChat.isEmpty())
                    dbChatRoom.get().setChats(new ConcurrentLinkedQueue<>(dbChat));

                chatRoom.set(dbChatRoom.get());
                publicChatRooms.put(chatRoom.get().getRoomId(), chatRoom.get());
            }
        }
        return Optional.ofNullable(chatRoom.get());
    }

    public Optional<ChatRoom> findPrivateRoomById(String roomId) throws Exception {
        AtomicReference<ChatRoom> chatRoom = new AtomicReference<>(privateChatRooms.get(roomId));
        if (null == chatRoom.get()) {
            var dbChatRoom = chatRoomRepository.findByRoomIdAndOpenType(roomId, RoomOpenType.PRIVATE);
            if (dbChatRoom.isPresent()) {
                var dbChat = chatRepository.findByRoomIdLatest(roomId);
                if (!dbChat.isEmpty())
                    dbChatRoom.get().setChats(new ConcurrentLinkedQueue<>(dbChat));

                chatRoom.set(dbChatRoom.get());
                privateChatRooms.put(chatRoom.get().getRoomId(), chatRoom.get());
            }
        }
        return Optional.ofNullable(chatRoom.get());
    }

    public ChatRoom createRoom(String name, WebSocketSession session, User user, RoomOpenType roomOpenType) throws Exception {
        var roomId = UUID.randomUUID().toString();
        var chatRoom = new ChatRoom(roomId, name, roomOpenType);

        chatRoom.getSessions().put(session, user.getUserRoom(roomId));
        switch (roomOpenType) {
            case PRIVATE:
                privateChatRooms.put(roomId, chatRoom);
                break;

            case PUBLIC:
                publicChatRooms.put(roomId, chatRoom);
                break;
        }
        chatRoomRepository.save(chatRoom);
        return chatRoom;
    }

    public ErrorExitChatRoom exitRoom(String roomId, WebSocketSession session) throws Exception {
        var existsRoom = findPrivateRoomById(roomId);

        if (existsRoom.isEmpty())
            existsRoom = findPublicRoomById(roomId);

        if (existsRoom.isEmpty())
            return ErrorExitChatRoom.NO_EXISTS_ROOM;

        if (existsRoom.get().getSessions().isEmpty()) {
            removeRoom(existsRoom.get().getOpenType(), roomId);
            return ErrorExitChatRoom.ROOM_REMOVED;
        }

        if (!existsRoom.get().getSessions().containsKey(session)) {
            return ErrorExitChatRoom.NOT_IN_ROOM;
        }

        existsRoom.get().getSessions().remove(session);

        if (existsRoom.get().getSessions().isEmpty()) {
            removeRoom(existsRoom.get().getOpenType(), roomId);
            return ErrorExitChatRoom.ROOM_REMOVED;
        }

        return ErrorExitChatRoom.NONE;
    }

    public void removeRoom(RoomOpenType openType, String roomId) throws Exception {
        switch (openType) {
            case PRIVATE:
                privateChatRooms.remove(roomId);
                break;

            case PUBLIC:
                publicChatRooms.remove(roomId);
                break;
        }
    }

    public void addChatToRoom(Chat chat) throws Exception {
        if (chat.getRoomId().isEmpty())
            return;

        var optChatRoom = findPrivateRoomById(chat.getRoomId());

        if (optChatRoom.isEmpty())
            optChatRoom = findPublicRoomById(chat.getRoomId());

        if (optChatRoom.isEmpty())
            return;

        optChatRoom.get().getChats().add(chat);
        chatRepository.save(chat);
    }

}
