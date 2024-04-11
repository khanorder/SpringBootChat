package com.zangho.game.server.service;

import com.zangho.game.server.define.RoomOpenType;
import com.zangho.game.server.domain.chat.*;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.error.ErrorEnterChatRoom;
import com.zangho.game.server.error.ErrorExitChatRoom;
import com.zangho.game.server.repository.chat.ChatRepository;
import com.zangho.game.server.repository.chat.ChatRoomRepository;
import com.zangho.game.server.repository.chat.UserRoomRepository;
import nl.martijndwars.webpush.Subscription;
import org.apache.commons.lang3.tuple.Pair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    public Optional<ChatRoom> findRoomById(String roomId) {
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

    public Optional<ChatRoom> startOneToOneChat(User user, User targetUser) throws Exception {
        var chatRoomInfo = chatRoomRepository.findOneToOneChatRoomInfo(user.getId(), targetUser.getId());
        if (chatRoomInfo.isEmpty())
            return createOneToOneChatRoom(user, targetUser);

        var result = enterRoom(chatRoomInfo.get().getRoomId(), user);
        if (result.getLeft().equals(ErrorEnterChatRoom.NONE) && result.getRight().isPresent())
            return result.getRight();

        return Optional.empty();
    }

    public Optional<ChatRoom> createRoom(String name, User user, RoomOpenType roomOpenType) {
        try {
            var roomId = UUID.randomUUID().toString();
            var chatRoom = new ChatRoom(roomId, name, roomOpenType);

            chatRoom.addUserToRoom(user);
            switch (roomOpenType) {
                case PRIVATE:
                    privateChatRooms.put(roomId, chatRoom);
                    break;

                case PUBLIC:
                    publicChatRooms.put(roomId, chatRoom);
                    break;
            }
            chatRoomRepository.save(chatRoom);
            userService.addUserChatRoomInfo(user, chatRoom);
            user.setCurrentChatRoom(Optional.of(chatRoom.getInfo()));
            return Optional.of(chatRoom);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return Optional.empty();
        }
    }

    public Optional<ChatRoom> createOneToOneChatRoom(User user, User targetUser) {
        try {
            var chatRoom = createRoom(targetUser.getName(), user, RoomOpenType.PRIVATE);
            if (chatRoom.isEmpty())
                return Optional.empty();

            // 1:1 대화상대의 정보를 채팅방 사용자 정보에 추가
            userRoomRepository.save(new UserRoom(targetUser.getId(), chatRoom.get().getRoomId()));
            return chatRoom;
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return Optional.empty();
        }
    }

    public Pair<ErrorEnterChatRoom, Optional<ChatRoom>> enterRoom(String roomId, User user) throws Exception {
        var existsRoom = findPrivateRoomById(roomId);

        if (existsRoom.isEmpty())
            existsRoom = findPublicRoomById(roomId);

        if (existsRoom.isEmpty())
            return Pair.of(ErrorEnterChatRoom.NO_EXISTS_ROOM, Optional.empty());

        if (!isAvailablePrivateRoom(existsRoom.get(), user))
            return Pair.of(ErrorEnterChatRoom.NOT_AVAILABLE_ROOM, Optional.empty());

        if (existsRoom.get().checkUserInRoom(user.getId()))
            return Pair.of(ErrorEnterChatRoom.ALREADY_IN_ROOM, Optional.empty());

        // 채팅방 메모리에 유저 정보 추가
        existsRoom.get().addUserToRoom(user);
        // 유저 메모리에 채팅방 정보 추가
        userService.addUserChatRoomInfo(user, existsRoom.get());

        return Pair.of(ErrorEnterChatRoom.NONE, existsRoom);
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

    public boolean isAvailablePrivateRoom(ChatRoom room, User user) {
        if (room.getOpenType().equals(RoomOpenType.PUBLIC)) {
            return true;
        } else {
            return userRoomRepository.existsByRoomIdAndUserId(room.getRoomId(), user.getId());
        }
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
