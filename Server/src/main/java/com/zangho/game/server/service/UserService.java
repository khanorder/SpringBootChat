package com.zangho.game.server.service;

import com.zangho.game.server.define.RelationState;
import com.zangho.game.server.define.RoomOpenType;
import com.zangho.game.server.domain.chat.*;
import com.zangho.game.server.domain.user.Relation;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.domain.user.UserInterface;
import com.zangho.game.server.repository.chat.ChatRoomRepository;
import com.zangho.game.server.repository.chat.UserRoomRepository;
import com.zangho.game.server.repository.user.RelationRepository;
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
    private final RelationRepository relationRepository;
    private final ConcurrentHashMap<String, User> connectedUsers;

    public UserService(UserRepository userRepository, ChatRoomRepository chatRoomRepository, UserRoomRepository userRoomRepository, RelationRepository relationRepository) {
        this.userRepository = userRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.userRoomRepository = userRoomRepository;
        this.relationRepository = relationRepository;
        this.connectedUsers = new ConcurrentHashMap<>();
    }

    public List<User> getConnectedUsers() {
        return connectedUsers.values().stream().toList();
    }

    public Optional<User> getConnectedUser(WebSocketSession session) {
        return connectedUsers.values().stream().filter(user -> !user.getSessionId().isEmpty() && user.getSessionId().equals(session.getId())).findAny();
    }

    public Optional<User> getConnectedUserByUserId(String userId) {
        return Optional.ofNullable(connectedUsers.get(userId));
    }

    public void removeConnectedUser(User user) {
        connectedUsers.remove(user.getId());
    }

    public boolean isConnectedUser(String userId) {
        return connectedUsers.values().stream().anyMatch(user -> user.getId().equals(userId));
    }

    public void addUserChatRoomInfo(User user, ChatRoom chatRoom) {
        if (user.getId().isEmpty())
            return;

        var currentUser = connectedUsers.get(user.getId());
        if (null == currentUser)
            return;

        if (currentUser.getChatRoomList().stream().anyMatch(chatRoomInfo -> chatRoomInfo.getRoomId().equals(chatRoom.getRoomId())))
            return;

        currentUser.setCurrentChatRoom(Optional.of(chatRoom.getInfo()));
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

    public Optional<User> findOnlyUser(String userId) throws Exception {
        return userRepository.findById(userId);
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

            var follows = findFollows(user.get());
            if (!follows.isEmpty())
                user.get().setFollowList(new ConcurrentLinkedQueue<>(follows));

            var followers = findFollowers(user.get());
            if (!followers.isEmpty())
                user.get().setFollowerList(new ConcurrentLinkedQueue<>(followers));

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

    public Optional<Relation> followUser(User user, User target) {
        var follower = new Relation(user.getId(), target.getId(), RelationState.FOLLOW);
        return Optional.ofNullable(relationRepository.save(follower));
    }

    public boolean unfollowUser(Relation relation) {
        relationRepository.delete(relation);
        return !relationRepository.existsById(relation.getId());
    }

    public Optional<Relation> banUser(User user, User target) {
        var follower = new Relation(user.getId(), target.getId(), RelationState.FOLLOW);
        return Optional.ofNullable(relationRepository.save(follower));
    }

    public Optional<Relation> findFollower(User user, User target) {
        return relationRepository.findByUserIdAndTargetIdAndRelationState(user.getId(), target.getId(), RelationState.FOLLOW);
    }

    public List<UserInterface> findFollows(User user) {
        return relationRepository.findMineRelatedUsers(user.getId(), RelationState.FOLLOW);
    }

    public List<UserInterface> findFollowers(User user) {
        return relationRepository.findYourRelatedUsers(user.getId(), RelationState.FOLLOW);
    }

    public List<UserInterface> findBans(User user) {
        return relationRepository.findMineRelatedUsers(user.getId(), RelationState.BAN);
    }

    public List<UserInterface> findBanned(User user) {
        return relationRepository.findYourRelatedUsers(user.getId(), RelationState.BAN);
    }

}
