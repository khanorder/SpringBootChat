package com.zangho.game.server.repository.user;

import com.zangho.game.server.define.RelationState;
import com.zangho.game.server.domain.user.Relation;
import com.zangho.game.server.domain.user.UserInterface;
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
    void delete(Relation entity);

    @Override
    boolean existsById(String s);

    @Override
    Optional<Relation> findById(String id);

    Optional<Relation> findByUserIdAndTargetIdAndRelationState(String userId, String targetId, RelationState relationState);

    @Query(
            value = "SELECT b.id AS id, b.nickName AS nickName, b.message AS message, b.latestActiveAt AS latestActiveAt, ('' != TRIM(b.profileImage)) AS haveProfile " +
                    "FROM relations AS a " +
                    "LEFT JOIN users AS b ON a.targetId = b.id " +
                    "WHERE a.userId = :userId AND a.relationState = :relationState",
            nativeQuery = true
    )
    List<UserInterface> findMineRelatedUsers(String userId, RelationState relationState);

    @Query(
            value = "SELECT b.id AS id, b.nickName AS nickName, b.message AS message, b.latestActiveAt AS latestActiveAt, ('' != TRIM(b.profileImage)) AS haveProfile " +
                    "FROM relations AS a " +
                    "LEFT JOIN users AS b ON a.userId = b.id " +
                    "WHERE a.targetId = :userId AND a.relationState = :relationState",
            nativeQuery = true
    )
    List<UserInterface> findYourRelatedUsers(String userId, RelationState relationState);

    @Override
    long count();
}
