package com.zangho.game.server.domain.chat;

import com.zangho.game.server.define.ChatType;
import com.zangho.game.server.domain.user.User;
import jakarta.annotation.Nonnull;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import java.util.Date;

@Entity
@Table(name = "chats")
@Data
@NoArgsConstructor
@RequiredArgsConstructor
public class Chat {
    @Id
    @Nonnull
    @Column(length = 36, unique = true, nullable = false)
    String chatId;

    @Nonnull
    @Column(length = 36, nullable = false)
    String roomId;

    @Nonnull
    @Column(length = 36, nullable = false)
    String userId;

    @Nonnull
    @Enumerated(EnumType.ORDINAL)
    @Column(nullable = false)
    ChatType type;

    @Nonnull
    @ColumnDefault("''")
    @Column(length = 65535, nullable = false)
    String message;

    @Nonnull
    @ColumnDefault(value = "current_timestamp(6)")
    @Column(length = 6, nullable = false)
    Date sendAt;
}
