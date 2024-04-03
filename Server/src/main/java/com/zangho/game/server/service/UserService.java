package com.zangho.game.server.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zangho.game.server.define.RoomOpenType;
import com.zangho.game.server.domain.chat.ChatRoom;
import com.zangho.game.server.domain.chat.ChatRoomInfo;
import com.zangho.game.server.domain.chat.ChatRoomInfoInterface;
import com.zangho.game.server.domain.chat.UserRoom;
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
    private ConcurrentHashMap<WebSocketSession, Optional<User>> connectedSessions;

    public UserService(UserRepository userRepository, ChatRoomRepository chatRoomRepository, UserRoomRepository userRoomRepository) {
        this.userRepository = userRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.userRoomRepository = userRoomRepository;
        this.connectedSessions = new ConcurrentHashMap<>();
    }

    public Set<WebSocketSession> getAllConnectedSessions() {
        return connectedSessions.keySet();
    }

    public void addEmptySession(WebSocketSession session) {
        connectedSessions.put(session, Optional.empty());
    }

    public Optional<User> getConnectedUser(WebSocketSession session) {
        return connectedSessions.get(session);
    }

    public Optional<User> getConnectedUserByUserId(String userId) {
        var optUser = connectedSessions.values().stream().filter(user -> user.isPresent() && user.get().getId().equals(userId)).findFirst();
        return optUser.orElseGet(Optional::empty);
    }

    public Collection<Optional<User>> getAllConnectedUsers() {
        return connectedSessions.values();
    }

    public void removeConnectedUserSession(WebSocketSession session) {
        connectedSessions.remove(session);
    }

    public boolean isConnectedUser(String userId) {
        return connectedSessions.values().stream().anyMatch(user -> user.isPresent() && user.get().getId().equals(userId));
    }

    public void setUserSession(WebSocketSession session, User user) {
        connectedSessions.computeIfPresent(session, (key, old) -> Optional.of(user));
    }

    public void addUserChatRoomInfo(WebSocketSession session, ChatRoom chatRoom) {
        var currentUser = connectedSessions.get(session);
        if (currentUser.isEmpty())
            return;

        logger.info("has roomInfo: " + currentUser.get().getChatRoomList().stream().anyMatch(chatRoomInfo -> chatRoomInfo.getRoomId().equals(chatRoom.getRoomId())));
        if (currentUser.get().getChatRoomList().stream().anyMatch(chatRoomInfo -> chatRoomInfo.getRoomId().equals(chatRoom.getRoomId())))
            return;

        currentUser.get().getChatRoomList().add(chatRoom.getInfo());
        logger.info("userId: " + currentUser.get().getId() + ", roomId: " + chatRoom.getRoomId());
        userRoomRepository.save(new UserRoom(currentUser.get().getId(), chatRoom.getRoomId()));
    }

    public int getConnectionCount() {
        return connectedSessions.size();
    }

    public Optional<User> createNewUser() throws Exception {
        var count = userRepository.count();
        var newUser = new User("user-" + (count + 1));
        var result = userRepository.save(newUser);
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

    public Pair<Optional<User>, List<ChatRoomInfoInterface>> findUserWithChatRooms(String userId) throws Exception {
        var user = userRepository.findById(userId);
        List<ChatRoomInfoInterface> availableChatRooms = new ArrayList<>();
        if (user.isPresent()) {
            // 입장한적 없지만 이용 가능한 채팅방
            availableChatRooms = chatRoomRepository.findAvailableChatRoomInfos(userId);

            // 입장했던 채팅방만
            var userChatRooms = chatRoomRepository.findInUserChatRoomInfos(userId);
            user.get().setChatRoomList(new ConcurrentLinkedQueue<>(getRoomInfosByUserId(userChatRooms)));
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
