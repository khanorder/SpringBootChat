package com.zangho.game.server.domain.chat;

import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;

@Entity
@Table(name = "emoticons")
@Data
@NoArgsConstructor
@RequiredArgsConstructor
public class ChatEmoticon {
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
    @Column(nullable = false, length = 6)
    @CreationTimestamp
    Date createAt;
}
