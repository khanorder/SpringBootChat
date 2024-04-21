package com.zangho.game.server.domain.user;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;

@Entity
@Table(name = "disposed_tokens")
@Data
@NoArgsConstructor
@RequiredArgsConstructor
public class DisposedToken {
    @Id
    @NonNull
    @Column(length = 36)
    private String id;

    @ColumnDefault(value = "current_timestamp(6)")
    @CreationTimestamp
    @Column(length = 6, nullable = false)
    Date disposeAt;
}
