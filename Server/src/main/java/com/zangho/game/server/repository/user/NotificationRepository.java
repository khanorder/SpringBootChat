package com.zangho.game.server.repository.user;

import com.zangho.game.server.domain.user.Notification;
import lombok.NonNull;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, String> {

    @Override
    <S extends Notification> S save(S entity);

    @Override
    <S extends Notification> List<S> findAll(Example<S> example);

    @Override
    @NonNull
    Optional<Notification> findById(@NonNull String id);

    @Override
    long count();
}
