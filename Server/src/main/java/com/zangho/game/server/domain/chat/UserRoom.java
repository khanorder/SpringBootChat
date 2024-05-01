package com.zangho.game.server.domain.chat;

import com.zangho.game.server.repository.chat.SubscriptionConverter;
import jakarta.annotation.Nonnull;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import nl.martijndwars.webpush.Subscription;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "user_rooms")
@Data
@AllArgsConstructor
@RequiredArgsConstructor
@IdClass(UserRoomId.class)
public class UserRoom {

    @Id
    @Nonnull
    @Column(length = 36, nullable = false)
    private String userId;

    @Id
    @Nonnull
    @Column(length = 36, nullable = false)
    private String roomId;

    @Convert(converter = SubscriptionConverter.class)
    @ColumnDefault("''")
    @Column(length = 1023)
    private Subscription subscription;

    public UserRoom() {
        this.userId = "";
        this.roomId = "";
        this.subscription = null;
    }

}