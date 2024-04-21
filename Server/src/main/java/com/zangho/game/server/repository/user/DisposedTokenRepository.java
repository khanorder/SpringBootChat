package com.zangho.game.server.repository.user;

import com.zangho.game.server.domain.user.DisposedToken;
import com.zangho.game.server.domain.user.User;
import lombok.NonNull;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DisposedTokenRepository extends JpaRepository<DisposedToken, String> {

    @Override
    <S extends DisposedToken> S save(S entity);

    @Override
    <S extends DisposedToken> List<S> findAll(Example<S> example);

    @Override
    @NonNull
    Optional<DisposedToken> findById(@NonNull String id);

    @Override
    boolean existsById(String s);

    @Override
    long count();
}