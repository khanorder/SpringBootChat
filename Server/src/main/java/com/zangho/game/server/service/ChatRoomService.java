package com.zangho.game.server.service;

import com.zangho.game.server.define.RoomOpenType;
import com.zangho.game.server.domain.chat.Chat;
import com.zangho.game.server.domain.chat.ChatRoom;
import com.zangho.game.server.domain.chat.UserRoom;
import com.zangho.game.server.domain.chat.UserRoomId;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.error.ErrorExitChatRoom;
import com.zangho.game.server.repository.chat.ChatRepository;
import com.zangho.game.server.repository.chat.ChatRoomRepository;
import com.zangho.game.server.repository.chat.UserRoomRepository;
import com.zangho.game.server.repository.user.UserRepository;
import nl.martijndwars.webpush.Subscription;
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
    private final UserRoomRepository userRoomRepository;
    private final UserService userService;
    private final ConcurrentHashMap<String, ChatRoom> publicChatRooms;
    private final ConcurrentHashMap<String, ChatRoom> privateChatRooms;

    public ChatRoomService(ChatRoomRepository chatRoomRepository, ChatRepository chatRepository, UserRoomRepository userRoomRepository, UserService userService) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatRepository = chatRepository;
        this.userRoomRepository = userRoomRepository;
        this.userService = userService;
        this.publicChatRooms = new ConcurrentHashMap<>();
        this.privateChatRooms = new ConcurrentHashMap<>();
    }

    public List<ChatRoom> findAllPublicChatRooms() throws Exception {
        return new ArrayList<>(publicChatRooms.values());
    }

    public List<ChatRoom> findAllPrivateChatRooms() throws Exception {
        return new ArrayList<>(privateChatRooms.values());
    }

    public List<ChatRoom> findAllPublicChatRoomsByUserId(String userId) throws Exception {
        return new ArrayList<>(publicChatRooms.values().stream().filter(chatRoom -> chatRoom.getUsers().containsKey(userId)).toList());
    }

    public List<ChatRoom> findAllPrivateChatRoomsByUserId(String userId) throws Exception {
        return new ArrayList<>(privateChatRooms.values().stream().filter(chatRoom -> chatRoom.getUsers().containsKey(userId)).toList());
    }

    public List<ChatRoom> findAllChatRoomsByUserId(String userId) throws Exception {
        List<ChatRoom> chatRoomList = new ArrayList<>();
        chatRoomList.addAll(findAllPublicChatRoomsByUserId(userId));
        chatRoomList.addAll(findAllPrivateChatRoomsByUserId(userId));

        return chatRoomList;
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

    public Optional<ChatRoom> findRoomById(String roomId) throws Exception {
        AtomicReference<ChatRoom> chatRoom = new AtomicReference<>(privateChatRooms.get(roomId));
        if (null == chatRoom.get())
            chatRoom = new AtomicReference<>(publicChatRooms.get(roomId));

        if (null == chatRoom.get()) {
            var dbChatRoom = chatRoomRepository.findById(roomId);
            if (dbChatRoom.isPresent()) {
                var dbChat = chatRepository.findByRoomIdLatest(roomId);
                if (!dbChat.isEmpty())
                    dbChatRoom.get().setChats(new ConcurrentLinkedQueue<>(dbChat));

                chatRoom.set(dbChatRoom.get());
                switch (chatRoom.get().getOpenType()) {
                    case PRIVATE:
                        privateChatRooms.put(chatRoom.get().getRoomId(), chatRoom.get());
                        break;

                    case PUBLIC:
                        publicChatRooms.put(chatRoom.get().getRoomId(), chatRoom.get());
                        break;
                }

            }
        }
        return Optional.ofNullable(chatRoom.get());
    }

    public ChatRoom createRoom(String name, User user, RoomOpenType roomOpenType) throws Exception {
        var roomId = UUID.randomUUID().toString();
        var chatRoom = new ChatRoom(roomId, name, roomOpenType);

        chatRoom.getUsers().put(user.getId(), user.getUserRoom(roomId));
        switch (roomOpenType) {
            case PRIVATE:
                privateChatRooms.put(roomId, chatRoom);
                break;

            case PUBLIC:
                publicChatRooms.put(roomId, chatRoom);
                break;
        }
        chatRoomRepository.save(chatRoom);
        userService.addUserChatRoomInfo(user.getId(), chatRoom);
        user.setCurrentChatRoom(Optional.of(chatRoom.getInfo()));
        return chatRoom;
    }

    public ErrorExitChatRoom exitRoom(ChatRoom chatRoom, User user) throws Exception {
        var existsRoom = findPrivateRoomById(chatRoom.getRoomId());

        if (existsRoom.isEmpty())
            existsRoom = findPublicRoomById(chatRoom.getRoomId());

        if (existsRoom.isEmpty())
            return ErrorExitChatRoom.NO_EXISTS_ROOM;

        if (existsRoom.get().getUsers().isEmpty()) {
            removeRoom(existsRoom.get().getOpenType(), chatRoom.getRoomId());
            return ErrorExitChatRoom.ROOM_REMOVED;
        }

        if (!existsRoom.get().getUsers().containsKey(user.getId())) {
            return ErrorExitChatRoom.NOT_IN_ROOM;
        }

        existsRoom.get().getUsers().remove(user.getId());

        if (existsRoom.get().getUsers().isEmpty()) {
            removeRoom(existsRoom.get().getOpenType(), chatRoom.getRoomId());
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

    public void subscribeUserRoom(Subscription subscription, String userId, String roomId) {
        var userRoom = userRoomRepository.findById(new UserRoomId(userId, roomId));
        if (userRoom.isEmpty()) {
            userRoom = Optional.of(new UserRoom(userId, roomId, subscription));
        } else {
            userRoom.get().setSubscription(subscription);
        }

        userRoomRepository.save(userRoom.get());
    }

}
