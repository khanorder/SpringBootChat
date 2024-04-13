package com.zangho.game.server.repository.chat;

import com.zangho.game.server.domain.chat.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, String> {

    @Override
    <S extends Chat> S save(S entity);

    @Override
    Optional<Chat> findById(String s);

    List<Chat> findByRoomId(String roomId);

    @Query(
            value = "SELECT * " +
                    "FROM chats AS a " +
                    //"WHERE a.roomId = :roomId AND a.sendAt >= DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 12 HOUR) " +
                    "WHERE a.roomId = :roomId " +
                    "ORDER BY a.sendAt LIMIT 100",
            nativeQuery = true
    )
    List<Chat> findByRoomIdLatest(@Param("roomId") String roomId);

    @Override
    long count();
}
