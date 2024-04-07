package com.zangho.game.server.repository.user;

import com.zangho.game.server.domain.user.Invitation;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvitaionRepository extends JpaRepository<Invitation, String> {

    @Override
    <S extends Invitation> S save(S entity);

    @Override
    <S extends Invitation> List<S> findAll(Example<S> example);

    @Override
    Optional<Invitation> findById(String id);

    Optional<Invitation> findByUserIdAndTargetId(String userId, String targetId);

    List<Invitation> findByUserIdOrderBySendAtDesc(String userId);

    @Override
    long count();
}
