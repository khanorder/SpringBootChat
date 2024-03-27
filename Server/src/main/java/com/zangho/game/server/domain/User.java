package com.zangho.game.server.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import java.util.Optional;
import java.util.Set;

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
    private Optional<ChatRoomInfo> chatRoom;

    public UserInRoom getUserInRoom() {
        return new UserInRoom(this.id, this.name);
    }
}
