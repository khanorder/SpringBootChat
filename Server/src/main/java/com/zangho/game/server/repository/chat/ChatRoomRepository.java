package com.zangho.game.server.repository.chat;

import com.zangho.game.server.define.RoomOpenType;
import com.zangho.game.server.domain.chat.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, String> {

    @Override
    <S extends ChatRoom> S save(S entity);

    @Override
    Optional<ChatRoom> findById(String s);

    Optional<ChatRoom> findByRoomIdAndOpenType(String roomId, RoomOpenType openType);

    @Query(
        value = "SELECT a.roomId AS roomId, a.roomName AS roomName, a.openType AS openType, (SELECT COUNT(d.roomId) FROM user_rooms AS d WHERE d.roomId = a.roomId) AS userCount " +
                "FROM chat_rooms AS a " +
                "RIGHT JOIN (SELECT * FROM user_rooms WHERE userId = :userId) AS b ON a.roomId = b.roomId " +
                "RIGHT JOIN (SELECT * FROM user_rooms WHERE userId = :targetUserId) AS c ON a.roomId = c.roomId " +
                "WHERE b.userId = :userId AND (SELECT COUNT(e.roomId) FROM user_rooms AS e WHERE e.roomId = a.roomId) = 2",
        nativeQuery = true
    )
    Optional<ChatRoomInfoInterface> findOneToOneChatRoomInfo(@Param("userId") String userId, @Param("targetUserId") String targetUserId);

    @Query(
            value = "SELECT a.roomId AS roomId, a.roomName AS roomName, a.openType AS openType, (SELECT COUNT(c.roomId) FROM user_rooms AS c WHERE c.roomId = a.roomId) AS userCount " +
                    "FROM chat_rooms AS a " +
                    "LEFT JOIN user_rooms AS b ON a.roomId = b.roomId " +
                    "WHERE (a.openType = 0 AND a.ownerId = :userId) OR (a.openType = 1 AND b.userId = :userId)",
            nativeQuery = true
    )
    List<ChatRoomInfoInterface> findInUserChatRoomInfos(@Param("userId") String userId);

    @Query(
            value = "SELECT a.roomId AS roomId, a.roomName AS roomName, a.openType AS openType, (SELECT COUNT(c.roomId) FROM user_rooms AS c WHERE c.roomId = a.roomId) AS userCount " +
                    "FROM chat_rooms AS a " +
                    "LEFT JOIN user_rooms AS b ON a.roomId = b.roomId " +
                    "WHERE (a.openType = 0 AND a.ownerId = :userId) OR (a.openType = 1 AND b.userId = :userId) OR a.openType = 2 " +
                    "GROUP BY a.roomId",
            nativeQuery = true
    )
    List<ChatRoomInfoInterface> findAvailableChatRoomInfos(@Param("userId") String userId);

    @Override
    long count();
}
