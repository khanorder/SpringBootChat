package com.zangho.game.server.domain.user;

import com.zangho.game.server.define.AccountType;
import com.zangho.game.server.define.AllowedImageType;
import com.zangho.game.server.domain.chat.ChatRoomInfo;
import com.zangho.game.server.domain.chat.UserRoom;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@RequiredArgsConstructor
public class User implements UserInterface, UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36)
    private String id;

    @NonNull
    @Enumerated(EnumType.ORDINAL)
    @Column(nullable = false)
    AccountType accountType;

    @NonNull
    @ColumnDefault("''")
    @Column(nullable = false, unique = true, length = 20)
    private String userName;

    @NonNull
    @ColumnDefault("''")
    @Column(nullable = false, length = 20)
    private String name;

    @NonNull
    @ColumnDefault("''")
    @Column(nullable = false, length = 20)
    private String nickName;

    @ColumnDefault("''")
    @Column(nullable = false)
    private String password = "";

    @ColumnDefault("''")
    @Column(nullable = false, length = 128)
    private String message = "";

    @Enumerated(EnumType.ORDINAL)
    @Column(nullable = false)
    AllowedImageType profileMime = AllowedImageType.NONE;

    @ColumnDefault(value = "''")
    @Column(nullable = false, length = 36)
    String profileImage = "";

    @ColumnDefault(value = "current_timestamp(6)")
    @UpdateTimestamp
    @Column(length = 6, nullable = false)
    Date latestActiveAt;

    @ColumnDefault(value = "current_timestamp(6)")
    @CreationTimestamp
    @Column(length = 6, nullable = false)
    Date createAt;

    @Transient
    public int getHaveProfile() {
        return this.profileImage.isEmpty() ? 0 : 1;
    }

    @Transient
    private String sessionId = "";

    @Transient
    private Optional<ChatRoomInfo> currentChatRoom = Optional.empty();

    @Transient
    private ConcurrentLinkedQueue<ChatRoomInfo> chatRoomList = new ConcurrentLinkedQueue<>();

    @Transient
    private ConcurrentLinkedQueue<UserInterface> followList = new ConcurrentLinkedQueue<>();

    @Transient
    private ConcurrentLinkedQueue<UserInterface> followerList = new ConcurrentLinkedQueue<>();

    @Transient
    private ConcurrentLinkedQueue<UserInterface> banList = new ConcurrentLinkedQueue<>();

    @Transient
    private ConcurrentLinkedQueue<UserInterface> bannedList = new ConcurrentLinkedQueue<>();

    @Transient
    public UserRoom getUserRoom(String roomId) {
        return new UserRoom(this.id, roomId);
    }

    @Transient
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> list = new ArrayList<>();
        list.add(new SimpleGrantedAuthority("ROLE_USER"));
        list.add(new SimpleGrantedAuthority("ROLE_" + this.accountType.name() + "_USER"));
        return list;
    }

    @Transient
    @Override
    public String getUsername() {
        return this.userName;
    }

    @Override
    public boolean isAccountNonExpired() {
        return false;
    }

    @Override
    public boolean isAccountNonLocked() {
        return false;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return false;
    }

    @Override
    public boolean isEnabled() {
        return false;
    }
}
