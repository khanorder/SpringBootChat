package com.zangho.game.server.domain.chat;

import jakarta.annotation.Nonnull;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "chat_reads")
@Data
@NoArgsConstructor
@RequiredArgsConstructor
public class ChatRead {
    @Id
    @Nonnull
    @Column(length = 36, unique = true, nullable = false)
    String chatId;

    @Id
    @Nonnull
    @Column(length = 36, unique = true, nullable = false)
    String userId;

    @Nonnull
    @Column(length = 6, nullable = false)
    Date readAt;
}
