package com.zangho.game.server.domain.chat;

import com.zangho.game.server.define.RoomOpenType;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatRoomInfo {
    private String roomId;
    private RoomOpenType openType;
}
