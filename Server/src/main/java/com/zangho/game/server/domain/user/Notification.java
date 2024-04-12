package com.zangho.game.server.domain.user;

import com.zangho.game.server.define.NotificationType;
import jakarta.annotation.Nonnull;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@RequiredArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;

    @Nonnull
    @Enumerated(EnumType.ORDINAL)
    @Column(nullable = false)
    NotificationType type;

    @Nonnull
    @Column(length = 36, nullable = false)
    private String userId;

    @Nonnull
    @ColumnDefault(value = "current_timestamp(6)")
    @CreationTimestamp
    @Column(length = 6, nullable = false)
    private Date sendAt;

    @Column(nullable = false)
    private boolean isCheck = false;

    @Column(length = 36, nullable = false)
    private String targetId = "";

    @ColumnDefault(value = "''")
    @Column(nullable = false)
    private String message = "";

    @ColumnDefault(value = "''")
    @Column(nullable = false)
    private String url = "";


}
