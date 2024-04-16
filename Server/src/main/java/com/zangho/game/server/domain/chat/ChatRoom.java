package com.zangho.game.server.domain.chat;

import com.zangho.game.server.define.RoomOpenType;
import com.zangho.game.server.domain.user.User;
import jakarta.annotation.Nonnull;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.springframework.web.socket.WebSocketSession;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Entity
@Table(name = "chat_rooms")
@Data
public class ChatRoom {

    @Id
    @Nonnull
    @Column(length = 36, unique = true, nullable = false)
    private String roomId;

    @Nonnull
    @Column(length = 20, nullable = false)
    private String roomName;

    @Nonnull
    @ColumnDefault("0")
    @Column(nullable = false)
    private RoomOpenType openType;

    @Nonnull
    @Column(length = 36, nullable = false)
    private String ownerId;

    @Transient
    private ConcurrentHashMap<String, UserRoom> users;

    @Transient
    private ConcurrentLinkedQueue<Chat> chats;

    public ChatRoom(@Nonnull String roomId, @Nonnull String roomName, @Nonnull RoomOpenType openType, @Nonnull String ownerId) {
        this.roomId = roomId;
        this.roomName = roomName;
        this.openType = openType;
        this.ownerId = ownerId;
        this.users = new ConcurrentHashMap<>();
        this.chats = new ConcurrentLinkedQueue<>();
    }

    public ChatRoom() {
        this.roomId = "";
        this.roomName = "";
        this.openType = RoomOpenType.PRIVATE;
        this.ownerId = "";
        this.users = new ConcurrentHashMap<>();
        this.chats = new ConcurrentLinkedQueue<>();
    }

    @Transient
    public ChatRoomInfo getInfo() {
        return new ChatRoomInfo(this.roomId, this.openType);
    }

    @Transient
    public Optional<UserRoom> addUserToRoom(UserRoom userRoom) {
        if (checkUserInRoom(userRoom.getUserId()))
            return Optional.empty();

        this.getUsers().put(userRoom.getUserId(), userRoom);
        return Optional.of(userRoom);
    }

    @Transient
    public Optional<UserRoom> addUserToRoom(User user) {
        if (checkUserInRoom(user.getId()))
            return Optional.empty();

        var userRoom = user.getUserRoom(this.roomId);
        return addUserToRoom(userRoom);
    }

    @Transient
    public Optional<UserRoom> addUserToRoom(String userId) {
        if (checkUserInRoom(userId))
            return Optional.empty();

        var userRoom = new UserRoom(userId, this.getRoomId());
        return addUserToRoom(userRoom);
    }

    @Transient
    public boolean checkUserInRoom(String userId) {
        return users.containsKey(userId);
    }

    @Transient
    public Optional<UserRoom> getUserRoom(User user) {
        return Optional.ofNullable(this.getUsers().get(user.getId()));
    }

}
