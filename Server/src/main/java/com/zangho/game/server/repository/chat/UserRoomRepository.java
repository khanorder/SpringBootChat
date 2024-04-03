package com.zangho.game.server.repository.chat;

import com.zangho.game.server.define.RoomOpenType;
import com.zangho.game.server.domain.chat.ChatRoom;
import com.zangho.game.server.domain.chat.ChatRoomInfo;
import com.zangho.game.server.domain.chat.UserRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRoomRepository extends JpaRepository<UserRoom, String> {

    @Override
    <S extends UserRoom> S save(S entity);

    Optional<UserRoom> findUserRoomByUserIdAndRoomId(String userId, String roomId);

    List<UserRoom> findUserRoomsByUserId(String userId);

    @Override
    long count();
}
