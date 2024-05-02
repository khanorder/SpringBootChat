package com.zangho.game.server.domain.user;

import com.zangho.game.server.repository.chat.SubscriptionConverter;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import nl.martijndwars.webpush.Subscription;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;

@Entity
@Table(name = "user_subscriptions")
@Data
@NoArgsConstructor
@RequiredArgsConstructor
public class UserSubscription {
    @Id
    @NonNull
    @Column(length = 36)
    private String id;

    @NonNull
    @Column(length = 36)
    private String userId;

    @NonNull
    @Convert(converter = SubscriptionConverter.class)
    @ColumnDefault("''")
    @Column(length = 1023)
    private Subscription subscription;

    @ColumnDefault(value = "current_timestamp(6)")
    @CreationTimestamp
    @Column(length = 6, nullable = false)
    Date createAt = new Date();
}
