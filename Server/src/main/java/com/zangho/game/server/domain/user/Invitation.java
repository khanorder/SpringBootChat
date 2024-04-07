package com.zangho.game.server.domain.user;

import com.zangho.game.server.define.InvitationState;
import jakarta.annotation.Nonnull;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;

@Entity
@Table(name = "invitations", uniqueConstraints = { @UniqueConstraint(name = "uniqueInvitation", columnNames = {"userId", "targetId"}) })
@Data
@NoArgsConstructor
@RequiredArgsConstructor
public class Invitation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Nonnull
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
    private InvitationState invitationState;

    @Nonnull
    @CreationTimestamp
    @Column(length = 6, nullable = false)
    Date sendAt;
}
