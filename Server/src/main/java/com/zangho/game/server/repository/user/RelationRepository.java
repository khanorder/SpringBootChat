package com.zangho.game.server.repository.user;

import com.zangho.game.server.define.RelationState;
import com.zangho.game.server.domain.user.FriendInterface;
import com.zangho.game.server.domain.user.Invitation;
import com.zangho.game.server.domain.user.Relation;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RelationRepository extends JpaRepository<Relation, String> {

    @Override
    <S extends Relation> S save(S entity);

    @Override
    <S extends Relation> List<S> findAll(Example<S> example);

    @Override
    Optional<Relation> findById(String id);

    @Query(value = "SELECT b.id AS userId, b.name AS userName, a.relatedAt FROM relation AS a LEFT JOIN users AS b ON a.targetId = b.id WHERE a.userId = :userId AND a.relationState = :relationState", nativeQuery = true)
    List<FriendInterface> findFriends(String userId, RelationState relationState);

    @Override
    long count();
}
