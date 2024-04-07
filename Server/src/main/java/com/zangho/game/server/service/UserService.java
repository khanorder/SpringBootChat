package com.zangho.game.server.service;

import com.zangho.game.server.define.RoomOpenType;
import com.zangho.game.server.domain.chat.*;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.repository.chat.ChatRoomRepository;
import com.zangho.game.server.repository.chat.UserRoomRepository;
import com.zangho.game.server.repository.user.UserRepository;
import org.apache.commons.lang3.tuple.Pair;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.WebSocketSession;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

public class UserService {

    private final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRoomRepository userRoomRepository;
    private final ConcurrentHashMap<String, User> connectedUsers;

    public UserService(UserRepository userRepository, ChatRoomRepository chatRoomRepository, UserRoomRepository userRoomRepository) {
        this.userRepository = userRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.userRoomRepository = userRoomRepository;
        this.connectedUsers = new ConcurrentHashMap<>();
    }

    public Optional<User> getConnectedUser(WebSocketSession session) {
        return connectedUsers.values().stream().filter(user -> !user.getSessionId().isEmpty() && user.getSessionId().equals(session.getId())).findAny();
    }

    public Optional<User> getConnectedUserByUserId(String userId) {
        return Optional.ofNullable(connectedUsers.get(userId));
    }

    public void removeConnectedUser(String userId) {
        connectedUsers.remove(userId);
    }

    public boolean isConnectedUser(String userId) {
        return connectedUsers.values().stream().anyMatch(user -> user.getId().equals(userId));
    }

    public void addUserChatRoomInfo(String userId, ChatRoom chatRoom) {
        if (userId.isEmpty())
            return;

        var currentUser = connectedUsers.get(userId);
        if (null == currentUser)
            return;

        if (currentUser.getChatRoomList().stream().anyMatch(chatRoomInfo -> chatRoomInfo.getRoomId().equals(chatRoom.getRoomId())))
            return;

        currentUser.getChatRoomList().add(chatRoom.getInfo());
        userRoomRepository.save(new UserRoom(currentUser.getId(), chatRoom.getRoomId()));
    }

    public Optional<User> createTempUser(WebSocketSession session) throws Exception {
        var count = userRepository.count();
        var tempUser = new User("user-" + (count + 1));
        var result = userRepository.save(tempUser);
        result.setSessionId(session.getId());
        return Optional.ofNullable(result);
    }

    public Optional<User> findUser(String userId) throws Exception {
        var user = userRepository.findById(userId);
        if (user.isPresent()) {
            var chatRooms = chatRoomRepository.findInUserChatRoomInfos(userId);
            user.get().setChatRoomList(new ConcurrentLinkedQueue<>(getRoomInfosByUserId(chatRooms)));
        }
        return user;
    }

    public Pair<Optional<User>, List<ChatRoomInfoInterface>> authenticateUser(String userId, WebSocketSession session) throws Exception {
        var user = userRepository.findById(userId);
        List<ChatRoomInfoInterface> availableChatRooms = new ArrayList<>();
        if (user.isPresent()) {
            // 입장한적 없지만 이용 가능한 채팅방
            availableChatRooms = chatRoomRepository.findAvailableChatRoomInfos(userId);

            // 입장했던 채팅방만
            var userChatRooms = chatRoomRepository.findInUserChatRoomInfos(userId);
            user.get().setChatRoomList(new ConcurrentLinkedQueue<>(getRoomInfosByUserId(userChatRooms)));
            user.get().setSessionId(session.getId());
            connectedUsers.computeIfAbsent(user.get().getId(), key -> user.get());
        }

        return Pair.of(user, availableChatRooms);
    }

    public List<ChatRoomInfo> getRoomInfosByUserId(List<ChatRoomInfoInterface> chatRooms) throws Exception {
        List<ChatRoomInfo> result = new ArrayList<>();
        if (chatRooms.isEmpty())
            return result;

        for (int i = 0; i < chatRooms.size(); i++) {
            try {
                if (null == chatRooms.get(i))
                    continue;

                var optOpenType = RoomOpenType.getType(chatRooms.get(i).getOpenType());
                if (optOpenType.isEmpty())
                    continue;

                result.add(new ChatRoomInfo(chatRooms.get(i).getRoomId(), optOpenType.get()));
            } catch (Exception ex) {
                logger.error(ex.getMessage(), ex);
            }
        }
        return result;
    }

    public boolean updateUser(User user) throws Exception {
        var existsUser = userRepository.save(user);
        return null != existsUser;
    }

}
