package com.zangho.game.server.repository.chat;

import com.zangho.game.server.define.RoomOpenType;
import com.zangho.game.server.domain.chat.ChatImage;
import com.zangho.game.server.domain.chat.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, String> {

    @Override
    <S extends ChatRoom> S save(S entity);

    @Override
    Optional<ChatRoom> findById(String s);

    Optional<ChatRoom> findByRoomIdAndOpenType(String roomId, RoomOpenType openType);

    List<ChatRoom> findByRoomName(String roomName);

    @Override
    long count();
}
