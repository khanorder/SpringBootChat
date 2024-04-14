package com.zangho.game.server.domain.user;

import com.zangho.game.server.domain.chat.ChatRoomInfo;
import com.zangho.game.server.domain.chat.UserRoom;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.util.Date;
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

    @ColumnDefault("''")
    @Column(nullable = false, length = 128)
    private String message = "";

    @ColumnDefault(value = "''")
    @Column(nullable = false)
    String profileMime = "";

    @ColumnDefault(value = "''")
    @Column(nullable = false, length = 1048576)
    String profileImage = "";

    @ColumnDefault(value = "''")
    @Column(nullable = false, length = 65536)
    String profileThumb = "";

    @ColumnDefault(value = "current_timestamp(6)")
    @UpdateTimestamp
    @Column(length = 6, nullable = false)
    Date latestActiveAt;

    @ColumnDefault(value = "current_timestamp(6)")
    @CreationTimestamp
    @Column(length = 6, nullable = false)
    Date createAt;

    @Transient
    public int getHaveProfile() {
        return this.profileImage.isEmpty() ? 0 : 1;
    }

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
        return new UserRoom(this.id, roomId);
    }
}
