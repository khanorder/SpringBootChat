package com.zangho.game.server.domain.chat;

import jakarta.annotation.Nonnull;
import jakarta.persistence.*;
import lombok.Data;
import nl.martijndwars.webpush.Subscription;
import org.hibernate.annotations.ColumnDefault;

import java.util.Optional;

@Entity
@Table(name = "user_rooms")
@Data
public class UserRoom {

    @Id
    @Nonnull
    @Column(length = 36, nullable = false)
    private String roomId;

    @Id
    @Nonnull
    @Column(length = 36, nullable = false)
    private String userId;

    @Transient
    private Optional<Subscription> subscription;

    public UserRoom(@Nonnull String roomId, @Nonnull String userId) {
        this.roomId = roomId;
        this.userId = userId;
        this.subscription = Optional.empty();
    }

    public UserRoom() {
        this.roomId = "";
        this.userId = "";
        this.subscription = Optional.empty();
    }

}
