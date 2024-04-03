package com.zangho.game.server.domain.chat;

public interface ChatRoomInfoInterface {
    String getRoomId();
    String getRoomName();
    int getOpenType();
    int getUserCount();
}
