package com.zangho.game.server.domain.chat;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;

@Entity
@Table(name = "images")
@Data
@NoArgsConstructor
@RequiredArgsConstructor
public class ChatImage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    String id;

    @NonNull
    @Column(unique = true, nullable = false, length = 36)
    String chatId;

    @NonNull
    @Column(nullable = false, length = 36)
    String roomId;

    @NonNull
    @Column(nullable = false, length = 36)
    String userId;

    @NonNull
    @Column(nullable = false)
    String mime;

    @NonNull
    @Column(nullable = false, length = 1048576)
    String data;

    @NonNull
    @Column(nullable = false, length = 65536)
    String smallData;

    @Nullable
    @ColumnDefault(value = "current_timestamp(6)")
    @Column(nullable = false, length = 6)
    @CreationTimestamp
    Date createAt;
}
