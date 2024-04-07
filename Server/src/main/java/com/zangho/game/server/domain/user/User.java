package com.zangho.game.server.domain.user;

import com.zangho.game.server.domain.chat.ChatRoomInfo;
import com.zangho.game.server.domain.chat.UserRoom;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import java.util.Optional;
import java.util.concurrent.ConcurrentLinkedQueue;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@RequiredArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;

    @NonNull
    @ColumnDefault("''")
    @Column(nullable = false, length = 20)
    private String name;

    @Transient
    private String sessionId = "";

    @Transient
    private Optional<ChatRoomInfo> currentChatRoom = Optional.empty();

    @Transient
    private ConcurrentLinkedQueue<ChatRoomInfo> chatRoomList = new ConcurrentLinkedQueue<>();

    @Transient
    public UserRoom getUserRoom(String roomId) {
        return new UserRoom(this.id, roomId, this.sessionId);
    }
}
