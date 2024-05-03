package com.zangho.game.server.service;

import com.zangho.game.server.define.RoomOpenType;
import com.zangho.game.server.domain.chat.*;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.error.ErrorEnterChatRoom;
import com.zangho.game.server.error.ErrorExitChatRoom;
import com.zangho.game.server.error.ErrorHistoryChatRoom;
import com.zangho.game.server.error.ErrorRemoveChatRoom;
import com.zangho.game.server.repository.chat.ChatRepository;
import com.zangho.game.server.repository.chat.ChatRoomRepository;
import com.zangho.game.server.repository.chat.UserRoomRepository;
import nl.martijndwars.webpush.Subscription;
import org.apache.commons.lang3.tuple.Pair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;

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
    private final ConcurrentHashMap<String, ChatRoom> preparedChatRooms;
    private final ConcurrentHashMap<String, ChatRoom> privateChatRooms;
    private final ConcurrentHashMap<String, ChatRoom> publicChatRooms;

    public ChatRoomService(ChatRoomRepository chatRoomRepository, ChatRepository chatRepository, UserRoomRepository userRoomRepository, UserService userService) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatRepository = chatRepository;
        this.userRoomRepository = userRoomRepository;
        this.userService = userService;
        this.preparedChatRooms = new ConcurrentHashMap<>();
        this.privateChatRooms = new ConcurrentHashMap<>();
        this.publicChatRooms = new ConcurrentHashMap<>();
    }

    public List<ChatRoom> findAllPreparedChatRoomsByUserId(String userId) {
        return new ArrayList<>(preparedChatRooms.values().stream().filter(chatRoom -> chatRoom.getUsers().containsKey(userId)).toList());
    }

    public List<ChatRoom> findAllPrivateChatRoomsByUserId(String userId) {
        return new ArrayList<>(privateChatRooms.values().stream().filter(chatRoom -> chatRoom.getUsers().containsKey(userId)).toList());
    }

    public List<ChatRoom> findAllPublicChatRoomsByUserId(String userId) {
        return new ArrayList<>(publicChatRooms.values().stream().filter(chatRoom -> chatRoom.getUsers().containsKey(userId)).toList());
    }

    public List<ChatRoom> findAllChatRoomsByUserId(String userId) {
        List<ChatRoom> chatRoomList = new ArrayList<>();
        chatRoomList.addAll(findAllPublicChatRoomsByUserId(userId));
        chatRoomList.addAll(findAllPrivateChatRoomsByUserId(userId));

        return chatRoomList;
    }

    public Optional<ChatRoom> findRoomById(String roomId) {
        AtomicReference<ChatRoom> chatRoom = new AtomicReference<>(preparedChatRooms.get(roomId));
        if (null == chatRoom.get())
            chatRoom = new AtomicReference<>(privateChatRooms.get(roomId));

        if (null == chatRoom.get())
            chatRoom = new AtomicReference<>(publicChatRooms.get(roomId));

        if (null == chatRoom.get()) {
            var dbChatRoom = chatRoomRepository.findById(roomId);
            if (dbChatRoom.isPresent()) {
                var userRooms = userRoomRepository.findUserRoomsByRoomId(roomId);
                if (!userRooms.isEmpty())
                    for (UserRoom userRoom : userRooms)
                        dbChatRoom.get().addUserToRoom(userRoom);

                var dbChats = chatRepository.findByRoomIdLatest(roomId);
                if (!dbChats.isEmpty())
                    dbChatRoom.get().setChats(new ConcurrentLinkedQueue<>(dbChats));

                chatRoom.set(dbChatRoom.get());
                addChatRoomMemory(chatRoom.get());
            }
        }
        return Optional.ofNullable(chatRoom.get());
    }

    public Optional<ChatRoom> startOneToOneChat(User user, User targetUser) {
        var chatRoomInfo = chatRoomRepository.findOneToOneChatRoomInfo(user.getId(), targetUser.getId());
        if (chatRoomInfo.isEmpty())
            return createOneToOneChatRoom(user, targetUser);

        var result = enterRoom(chatRoomInfo.get().getRoomId(), user);
        if (result.getLeft().equals(ErrorEnterChatRoom.NONE) && result.getRight().isPresent()) {
            return result.getRight();
        }

        return Optional.empty();
    }

    public Optional<ChatRoom> createRoom(String name, User user, RoomOpenType roomOpenType) {
        try {
            var roomId = UUID.randomUUID().toString();
            var chatRoom = new ChatRoom(roomId, name, roomOpenType, user.getId());
            var optUserRoom = chatRoom.addUserToRoom(user);
            optUserRoom.ifPresent(userRoomRepository::save);
            addChatRoomMemory(chatRoom);
            chatRoomRepository.save(chatRoom);
            userService.addUserChatRoomInfo(user, chatRoom);
            user.setCurrentChatRoom(Optional.of(chatRoom.getInfo()));
            return Optional.of(chatRoom);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return Optional.empty();
        }
    }

    public Optional<UserRoom> addUserToRoom(UserRoom userRoom, ChatRoom chatRoom) {
        try {
            var optUserRoom = chatRoom.addUserToRoom(userRoom);
            optUserRoom.ifPresent(userRoomRepository::save);
            return optUserRoom;
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return Optional.empty();
        }
    }

    public Optional<UserRoom> addUserToRoom(User user, ChatRoom chatRoom) {
        return addUserToRoom(new UserRoom(user.getId(), chatRoom.getRoomId()), chatRoom);
    }

    public Optional<UserRoom> addUserToRoom(String userId, ChatRoom chatRoom) {
        return addUserToRoom(new UserRoom(userId, chatRoom.getRoomId()), chatRoom);
    }

    public Optional<ChatRoom> createOneToOneChatRoom(User user, User targetUser) {
        try {
            var optChatRoom = createRoom(targetUser.getNickName(), user, RoomOpenType.PREPARED);
            if (optChatRoom.isEmpty())
                return Optional.empty();

            // 1:1 대화상대의 정보를 채팅방 사용자 정보에 추가
            userRoomRepository.save(new UserRoom(targetUser.getId(), optChatRoom.get().getRoomId()));
            optChatRoom.get().addUserToRoom(targetUser);
            return optChatRoom;
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return Optional.empty();
        }
    }

    public Pair<ErrorEnterChatRoom, Optional<ChatRoom>> enterRoom(String roomId, User user) {
        var existsRoom = findRoomById(roomId);

        if (existsRoom.isEmpty())
            return Pair.of(ErrorEnterChatRoom.NO_EXISTS_ROOM, Optional.empty());

        if (!isAvailableRoom(existsRoom.get(), user))
            return Pair.of(ErrorEnterChatRoom.NOT_AVAILABLE_ROOM, Optional.empty());

        if (!existsRoom.get().checkUserInRoom(user.getId())) {
            // 채팅방 메모리에 유저 정보 추가
            existsRoom.get().addUserToRoom(user);
        }

        var enteredChatRoomInfo = userService.getEnteredChatRoomInfo(user);
        if (enteredChatRoomInfo.isPresent() && enteredChatRoomInfo.get().getRoomId().equals(roomId))
            return Pair.of(ErrorEnterChatRoom.ALREADY_IN_ROOM, existsRoom);

        // 유저 메모리에 채팅방 정보 추가
        userService.addUserChatRoomInfo(user, existsRoom.get());

        return Pair.of(ErrorEnterChatRoom.NONE, existsRoom);
    }

    public Pair<ErrorHistoryChatRoom, Optional<ChatRoom>> getRoomWithHistory(String roomId, User user) {
        var existsRoom = findRoomById(roomId);

        if (existsRoom.isEmpty())
            return Pair.of(ErrorHistoryChatRoom.NO_EXISTS_ROOM, Optional.empty());

        if (!isAvailableRoom(existsRoom.get(), user))
            return Pair.of(ErrorHistoryChatRoom.NOT_AVAILABLE_ROOM, Optional.empty());

        return Pair.of(ErrorHistoryChatRoom.NONE, existsRoom);
    }

    public ErrorExitChatRoom exitRoom(ChatRoom chatRoom, User user) {
        var existsRoom = findRoomById(chatRoom.getRoomId());

        if (existsRoom.isEmpty())
            return ErrorExitChatRoom.NO_EXISTS_ROOM;

        if (existsRoom.get().getUsers().isEmpty()) {
            removeChatRoomMemory(existsRoom.get().getOpenType(), chatRoom.getRoomId());
            return ErrorExitChatRoom.ROOM_REMOVED;
        }

        if (!existsRoom.get().getUsers().containsKey(user.getId())) {
            return ErrorExitChatRoom.NOT_IN_ROOM;
        }

        return ErrorExitChatRoom.NONE;
    }

    public Pair<ErrorRemoveChatRoom, Optional<ChatRoom>> removeUserRoom(String roomId, User user) throws Exception {
        var existsRoom = findRoomById(roomId);

        if (existsRoom.isEmpty())
            return Pair.of(ErrorRemoveChatRoom.NOT_FOUND_CHAT_ROOM, Optional.empty());

        if (existsRoom.get().getOpenType().equals(RoomOpenType.PUBLIC))
            return Pair.of(ErrorRemoveChatRoom.NOT_ALLOWED_OPEN_TYPE, Optional.empty());

        var optUserRoom = existsRoom.get().getUserRoom(user);
        if (optUserRoom.isEmpty())
            return Pair.of(ErrorRemoveChatRoom.NOT_IN_ROOM, Optional.empty());

        userRoomRepository.delete(optUserRoom.get());
        if (userRoomRepository.existsByRoomIdAndUserId(roomId, user.getId()))
            return Pair.of(ErrorRemoveChatRoom.FAILED_TO_REMOVE, Optional.empty());

        existsRoom.get().getUsers().remove(user.getId());

        if (existsRoom.get().getUsers().isEmpty()) {
            removeChatRoomMemory(existsRoom.get().getOpenType(), roomId);
            existsRoom.get().setOwnerId("");
            chatRoomRepository.save(existsRoom.get());
        } else if (existsRoom.get().getOwnerId().equals(user.getId())) {
            existsRoom.get().setOwnerId(existsRoom.get().getUsers().keys().nextElement());
        }

        return Pair.of(ErrorRemoveChatRoom.NONE, existsRoom);
    }

    @Async
    public void addChatRoomMemory(ChatRoom chatRoom) {
        try {
            switch (chatRoom.getOpenType()) {
                case PREPARED:
                    preparedChatRooms.put(chatRoom.getRoomId(), chatRoom);
                    break;

                case PRIVATE:
                    privateChatRooms.put(chatRoom.getRoomId(), chatRoom);
                    break;

                case PUBLIC:
                    publicChatRooms.put(chatRoom.getRoomId(), chatRoom);
                    break;
            }
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void removeChatRoomMemory(RoomOpenType openType, String roomId) {
        try {
            switch (openType) {
                case PREPARED:
                    preparedChatRooms.remove(roomId);
                    break;

                case PRIVATE:
                    privateChatRooms.remove(roomId);
                    break;

                case PUBLIC:
                    publicChatRooms.remove(roomId);
                    break;
            }
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void startPreparedChatRoom(ChatRoom chatRoom) {
        if (!chatRoom.getOpenType().equals(RoomOpenType.PREPARED))
            return;

        chatRoom.setOpenType(RoomOpenType.PRIVATE);
        removeChatRoomMemory(RoomOpenType.PREPARED, chatRoom.getRoomId());
        addChatRoomMemory(chatRoom);
        chatRoomRepository.save(chatRoom);
    }

    @Async
    public void addChatToRoom(Chat chat) {
        if (chat.getRoomId().isEmpty())
            return;

        var optChatRoom = findRoomById(chat.getRoomId());

        if (optChatRoom.isEmpty())
            return;

        optChatRoom.get().getChats().add(chat);
        chatRepository.save(chat);
    }

    public boolean isAvailableRoom(ChatRoom room, User user) {
        if (room.getOpenType().equals(RoomOpenType.PUBLIC)) {
            return true;
        } else {
            return userRoomRepository.existsByRoomIdAndUserId(room.getRoomId(), user.getId());
        }
    }

}
