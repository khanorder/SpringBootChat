package com.zangho.game.server.repository;

import com.zangho.game.server.domain.User;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    @Override
    <S extends User> S save(S entity);

    @Override
    <S extends User> List<S> findAll(Example<S> example);

    @Override
    Optional<User> findById(String s);

    Optional<User> findByName(String name);

    @Override
    long count();
}
