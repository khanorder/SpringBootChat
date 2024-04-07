package com.zangho.game.server.domain.chat;

import com.zangho.game.server.define.RoomOpenType;
import com.zangho.game.server.domain.user.User;
import jakarta.annotation.Nonnull;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.springframework.web.socket.WebSocketSession;

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
    @Column(length = 10, nullable = false)
    private String roomName;

    @Nonnull
    @ColumnDefault("0")
    @Column(nullable = false)
    private RoomOpenType openType;

    @Transient
    private ConcurrentHashMap<String, UserRoom> users;

    @Transient
    private ConcurrentLinkedQueue<Chat> chats;

    public ChatRoom(@Nonnull String roomId, @Nonnull String roomName, @Nonnull RoomOpenType openType) {
        this.roomId = roomId;
        this.roomName = roomName;
        this.openType = openType;
        this.users = new ConcurrentHashMap<>();
        this.chats = new ConcurrentLinkedQueue<>();
    }

    public ChatRoom() {
        this.roomId = "";
        this.roomName = "";
        this.openType = RoomOpenType.PRIVATE;
        this.users = new ConcurrentHashMap<>();
        this.chats = new ConcurrentLinkedQueue<>();
    }

    @Transient
    public ChatRoomInfo getInfo() {
        return new ChatRoomInfo(this.roomId, this.openType);
    }

    @Transient
    public void addUserToRoom(User user) {
        if (checkUserInRoom(user.getId()))
            return;

        this.getUsers().put(user.getId(), user.getUserRoom(this.roomId));
    }

    @Transient
    public boolean checkUserInRoom(String userId) {
        return users.containsKey(userId);
    }

    @Transient
    public UserRoom getUserRoom(User user) {
        return this.getUsers().get(user.getId());
    }

}
