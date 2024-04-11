package com.zangho.game.server.domain.user;

import com.zangho.game.server.define.RelationState;
import jakarta.annotation.Nonnull;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;

@Entity
@Table(name = "relations", uniqueConstraints = { @UniqueConstraint(name = "uniqRelation", columnNames = {"userId", "targetId"}) })
@Data
@NoArgsConstructor
@RequiredArgsConstructor
public class Relation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36, nullable = false)
    private String id;

    @Nonnull
    @Column(length = 36, nullable = false)
    private String userId;

    @Nonnull
    @Column(length = 36, nullable = false)
    private String targetId;

    @Nonnull
    @Column(nullable = false)
    private RelationState relationState;

    @CreationTimestamp
    @ColumnDefault(value = "current_timestamp(6)")
    @Column(length = 6, nullable = false)
    Date relatedAt;
}
