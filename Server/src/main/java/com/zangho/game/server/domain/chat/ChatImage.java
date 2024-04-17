package com.zangho.game.server.domain.chat;

import com.zangho.game.server.define.AllowedImageType;
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
    @Enumerated(EnumType.ORDINAL)
    @Column(nullable = false)
    AllowedImageType mime;
}
