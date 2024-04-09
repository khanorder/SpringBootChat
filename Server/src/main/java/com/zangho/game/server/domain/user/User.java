package com.zangho.game.server.domain.user;

import com.zangho.game.server.domain.chat.ChatRoomInfo;
import com.zangho.game.server.domain.chat.UserRoom;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.util.Optional;
import java.util.concurrent.ConcurrentLinkedQueue;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@RequiredArgsConstructor
public class User implements UserInterface {
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
    private ConcurrentLinkedQueue<UserInterface> followList = new ConcurrentLinkedQueue<>();

    @Transient
    private ConcurrentLinkedQueue<UserInterface> followerList = new ConcurrentLinkedQueue<>();

    @Transient
    private ConcurrentLinkedQueue<UserInterface> banList = new ConcurrentLinkedQueue<>();

    @Transient
    private ConcurrentLinkedQueue<UserInterface> bannedList = new ConcurrentLinkedQueue<>();

    @Transient
    public UserRoom getUserRoom(String roomId) {
        return new UserRoom(this.id, roomId, this.sessionId);
    }
}
