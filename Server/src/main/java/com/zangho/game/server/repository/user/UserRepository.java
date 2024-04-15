package com.zangho.game.server.repository.user;

import com.zangho.game.server.domain.user.User;
import lombok.NonNull;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    @Override
    <S extends User> S save(S entity);

    @Override
    <S extends User> List<S> findAll(Example<S> example);

    List<User> findTop20ByOrderByLatestActiveAtDesc();

    @Override
    @NonNull
    Optional<User> findById(@NonNull String id);

    Optional<User> findByName(String name);

    @Override
    long count();
}
