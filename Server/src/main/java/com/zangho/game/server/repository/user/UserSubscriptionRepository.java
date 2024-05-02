package com.zangho.game.server.repository.user;

import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.domain.user.UserSubscription;
import lombok.NonNull;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, String> {

    @Override
    <S extends UserSubscription> S save(S entity);

    @Override
    <S extends UserSubscription> List<S> findAll(Example<S> example);

    @Override
    @NonNull
    Optional<UserSubscription> findById(@NonNull String id);

    List<UserSubscription> findByUserId(@NonNull String userId);

    @Override
    long count();
}
