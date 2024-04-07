package com.zangho.game.server.socketHandler.chat;

import com.zangho.game.server.define.PacketType;
import com.zangho.game.server.define.Types;
import com.zangho.game.server.domain.chat.ChatRoom;
import com.zangho.game.server.error.ErrorExitChatRoom;
import com.zangho.game.server.helper.Helpers;
import com.zangho.game.server.service.ChatRoomService;
import com.zangho.game.server.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.WebSocketSession;

public class SendHandler {

    private final Logger logger = LoggerFactory.getLogger(SendHandler.class);
    private final boolean isDevelopment;
    private final SessionHandler sessionHandler;
    private final UserService userService;

    public SendHandler(SessionHandler sessionHandler, UserService userService) {
        var config = System.getProperty("Config");
        isDevelopment = null == config || !config.equals("production");
        this.sessionHandler = sessionHandler;
        this.userService = userService;
    }

    public void noticeRoomUserExited(ChatRoom chatRoom, String userName) throws Exception {
        var sendNoticePacketFlag = Helpers.getPacketFlag(PacketType.NOTICE_EXIT_CHAT_ROOM);
        var sendNoticePacket = Helpers.mergeBytePacket(sendNoticePacketFlag, Helpers.getByteArrayFromUUID(chatRoom.getRoomId()), userName.getBytes());
        sessionHandler.sendEachSessionInRoom(chatRoom, sendNoticePacket);
    }

    public void noticeRoomUsersChanged(ChatRoom chatRoom) throws Exception {
        if (chatRoom.getUsers().isEmpty())
            return;

        var bytesUpdatePacketFlag = Helpers.getPacketFlag(PacketType.UPDATE_CHAT_ROOM);

        var bytesRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());

        // 입장한 사용자 숫자는 int32
        var bytesUserCount = Helpers.getByteArrayFromInt(chatRoom.getUsers().size());

        var bytesUserIds = new byte[0];
        var bytesUserNameLengths = new byte[0];
        var bytesUserNames = new byte[0];
        var userIds = chatRoom.getUsers().keys();
        while (userIds.hasMoreElements()) {
            var userId = userIds.nextElement();
            var optUser = userService.getConnectedUserByUserId(userId);
            if (optUser.isEmpty())
                continue;

            var user = optUser.get();
            bytesUserIds = Helpers.mergeBytePacket(bytesUserIds, Helpers.getByteArrayFromUUID(user.getId()));
            var bytesUserName = user.getName().getBytes();
            bytesUserNameLengths = Helpers.mergeBytePacket(bytesUserNameLengths, new byte[] {(byte)bytesUserName.length});
            bytesUserNames = Helpers.mergeBytePacket(bytesUserNames, bytesUserName);
        }

        var packet = Helpers.mergeBytePacket(bytesUpdatePacketFlag, bytesRoomId, bytesUserCount, bytesUserIds, bytesUserNameLengths, bytesUserNames);
        sessionHandler.sendEachSessionInRoom(chatRoom, packet);
    }

    public void noticeRoomUserNameChanged(ChatRoom chatRoom, String oldUserName, String newUserName) throws Exception {
        var sendNoticePacketFlag = Helpers.getPacketFlag(PacketType.NOTICE_CHANGE_NAME_CHAT_ROOM);
        var sendNoticePacket = Helpers.mergeBytePacket(
                sendNoticePacketFlag,
                Helpers.getByteArrayFromUUID(chatRoom.getRoomId()),
                (new byte[] {(byte) oldUserName.getBytes().length}),
                oldUserName.getBytes(),
                newUserName.getBytes()
        );
        sessionHandler.sendEachSessionInRoom(chatRoom, sendNoticePacket);
    }

    public void sendAddChatRoom(WebSocketSession session, ChatRoom chatRoom) throws Exception {
        var addChatRoomPacket = getAddChatRoomPackets(chatRoom);
        switch (chatRoom.getOpenType()) {
            case PRIVATE:
                sessionHandler.sendOneSession(session, addChatRoomPacket);
                break;

            case PUBLIC:
                sessionHandler.sendAll(addChatRoomPacket);
                break;
        }
    }

    public void sendAddChatRoom(ChatRoom chatRoom) throws Exception {
        var addChatRoomPacket = getAddChatRoomPackets(chatRoom);
        switch (chatRoom.getOpenType()) {
            case PRIVATE:
                if (chatRoom.getUsers().isEmpty())
                    return;

                sessionHandler.sendEachSessionInRoom(chatRoom, addChatRoomPacket);
                break;

            case PUBLIC:
                sessionHandler.sendAll(addChatRoomPacket);
                break;
        }
    }

    private byte[] getAddChatRoomPackets(ChatRoom chatRoom) throws Exception {
        var bytesAddRoomFlag = Helpers.getPacketFlag(PacketType.ADD_CHAT_ROOM);
        var bytesAddRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
        var bytesAddRoomOpenType = Helpers.getPacketFlag(chatRoom.getOpenType());
        var bytesAddRoomUserCount = Helpers.getByteArrayFromInt(chatRoom.getUsers().size());
        var bytesAddRoomName = chatRoom.getRoomName().getBytes();
        return Helpers.mergeBytePacket(bytesAddRoomFlag, bytesAddRoomId, bytesAddRoomOpenType, bytesAddRoomUserCount, bytesAddRoomName);
    }

    private byte[] getRemoveChatRoomPackets(String roomId) throws Exception {
        var bytesRemoveRoomFlag = Helpers.getPacketFlag(PacketType.REMOVE_CHAT_ROOM);
        var bytesRemoveRoomId = Helpers.getByteArrayFromUUID(roomId);
        return Helpers.mergeBytePacket(bytesRemoveRoomFlag, bytesRemoveRoomId);
    }

}
