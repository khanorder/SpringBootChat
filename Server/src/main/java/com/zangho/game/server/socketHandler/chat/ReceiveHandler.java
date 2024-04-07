package com.zangho.game.server.socketHandler.chat;

import com.zangho.game.server.define.ChatType;
import com.zangho.game.server.define.PacketType;
import com.zangho.game.server.define.RoomOpenType;
import com.zangho.game.server.domain.chat.Chat;
import com.zangho.game.server.domain.chat.ChatRoom;
import com.zangho.game.server.domain.chat.ChatRoomInfoInterface;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.error.*;
import com.zangho.game.server.helper.Helpers;
import com.zangho.game.server.service.ChatRoomService;
import com.zangho.game.server.service.LineNotifyService;
import com.zangho.game.server.service.MessageService;
import com.zangho.game.server.service.UserService;
import lombok.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;

import java.util.*;

public class ReceiveHandler {

    private final Logger logger = LoggerFactory.getLogger(SendHandler.class);
    private final boolean isDevelopment;
    private final SessionHandler sessionHandler;
    private final SendHandler sendHandler;
    private final UserService userService;
    private final ChatRoomService chatRoomService;
    private final LineNotifyService lineNotifyService;
    private final MessageService messageService;

    public ReceiveHandler(SessionHandler sessionHandler, SendHandler sendHandler, UserService userService, ChatRoomService chatRoomService, LineNotifyService lineNotifyService, MessageService messageService) {
        var config = System.getProperty("Config");
        isDevelopment = null == config || !config.equals("production");
        this.sessionHandler = sessionHandler;
        this.sendHandler = sendHandler;
        this.userService = userService;
        this.chatRoomService = chatRoomService;
        this.lineNotifyService = lineNotifyService;
        this.messageService = messageService;
    }

    public void onAfterConnectionEstablished(@NonNull WebSocketSession session) {
        try {
            sessionHandler.addSession(session);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
        sessionHandler.consoleLogState("connected");
        lineNotifyService.Notify("채팅샘플 접속 (" + Helpers.getSessionIP(session) + ")");
    }

    public void onAfterConnectionClosed(@NonNull WebSocketSession closeSession, @NonNull CloseStatus status) {
        try {
            var user = userService.getConnectedUser(closeSession);
            if (user.isPresent()) {
                // 입장중인 채팅방에서 유저정보 제거 후 퇴장 알림
                for (ChatRoom chatRoom : chatRoomService.findAllChatRoomsByUserId(user.get().getId())) {
                    try {
                        var userRoom = chatRoom.getUsers().get(user.get().getId());
                        if (null == userRoom)
                            continue;

                        var exitResult = chatRoomService.exitRoom(chatRoom, user.get());

                        if (ErrorExitChatRoom.NONE == exitResult) {
                            sendHandler.noticeRoomUserExited(chatRoom, user.get().getName());
                            sendHandler.noticeRoomUsersChanged(chatRoom);
                        }
                    } catch (Exception ex) {
                        logger.error(ex.getMessage(), ex);
                    }
                }

                // 연결된 유저 정보 제거
                userService.removeConnectedUser(user.get().getId());
            }

            // 세션제거
            sessionHandler.removeSession(closeSession);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
        sessionHandler.consoleLogState("disconnected");
        lineNotifyService.Notify("채팅샘플 접속종료 (" + Helpers.getSessionIP(closeSession) + ")");
    }

    public void onCheckConnection(PacketType packetType, WebSocketSession session, byte[] packet) {
        if (isDevelopment)
            logger.info(packetType.name() + ": " + Helpers.getSessionIP(session));

    }

    public void onCheckAuthentication(PacketType packetType, WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        if (isDevelopment)
            logger.info(packetType.name() + ": " + Helpers.getSessionIP(session));

        try {
            var sendCallerPacketFlag = Helpers.getPacketFlag(packetType, ErrorCheckAuth.NONE);

            if (connectedUser.isPresent()) {
                sendCallerPacketFlag = Helpers.getPacketFlag(packetType, ErrorCheckAuth.ALREADY_SIGN_IN_USER);
                sessionHandler.sendOneSession(session, sendCallerPacketFlag);
                return;
            }

            Optional<User> optUser = Optional.empty();
            List<ChatRoomInfoInterface> chatRooms = new ArrayList<>();
            if (17 == packet.length) {
                var bytesUserId = Arrays.copyOfRange(packet, 1, 17);
                var userId = Helpers.getUUIDFromByteArray(bytesUserId);
                if (userService.isConnectedUser(userId)) {
                    sendCallerPacketFlag = Helpers.getPacketFlag(packetType, ErrorCheckAuth.ALREADY_SIGN_IN_USER);
                    sessionHandler.sendOneSession(session, sendCallerPacketFlag);
                    return;
                }

                var authenticatedUserInfo = userService.authenticateUser(userId, session);
                optUser = authenticatedUserInfo.getLeft();
                chatRooms = authenticatedUserInfo.getRight();
            }

            if (optUser.isEmpty()) {
                optUser = userService.createTempUser(session);
                if (optUser.isEmpty()) {
                    sendCallerPacketFlag = Helpers.getPacketFlag(packetType, ErrorCheckAuth.FAILED_TO_CREATE_USER);
                    sessionHandler.sendOneSession(session, sendCallerPacketFlag);
                    sessionHandler.consoleLogPackets(sendCallerPacketFlag, "failed create user");
                    return;
                }
            }

            var bytesUserId = Helpers.getByteArrayFromUUID(optUser.get().getId());
            var bytesUserNameLength = new byte[] {(byte)optUser.get().getName().getBytes().length};
            var bytesUserName = optUser.get().getName().getBytes();
            var bytesChatRoomCount = Helpers.getByteArrayFromInt(chatRooms.size());
            var bytesRoomIds = new byte[0];
            var bytesRoomOpenTypes = new byte[0];
            var bytesUserCounts = new byte[0];
            var bytesRoomNameLengths = new byte[0];
            var bytesRoomNames = new byte[0];
            if (!chatRooms.isEmpty()) {
                for (ChatRoomInfoInterface chatRoom : chatRooms) {
                    bytesRoomIds = Helpers.mergeBytePacket(bytesRoomIds, Helpers.getByteArrayFromUUID(chatRoom.getRoomId()));
                    bytesRoomOpenTypes = Helpers.mergeBytePacket(bytesRoomOpenTypes, new byte[]{(byte)chatRoom.getOpenType()});
                    bytesUserCounts = Helpers.mergeBytePacket(bytesUserCounts, Helpers.getByteArrayFromInt(chatRoom.getUserCount()));
                    bytesRoomNameLengths = Helpers.mergeBytePacket(bytesRoomNameLengths, new byte[]{(byte)chatRoom.getRoomName().getBytes().length});
                    bytesRoomNames = Helpers.mergeBytePacket(bytesRoomNames, chatRoom.getRoomName().getBytes());
                }
            }
            var sendCallerPacket = Helpers.mergeBytePacket(sendCallerPacketFlag, bytesUserId, bytesUserNameLength, bytesUserName, bytesChatRoomCount, bytesRoomIds, bytesRoomOpenTypes, bytesUserCounts, bytesRoomNameLengths, bytesRoomNames);
            sessionHandler.sendOneSession(session, sendCallerPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onChangeUserName(PacketType packetType, WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        if (isDevelopment)
            logger.info(packetType.name() + ": " + Helpers.getSessionIP(session));

        try {
            var bytesUserId = Arrays.copyOfRange(packet, 1, 17);
            var userId = Helpers.getUUIDFromByteArray(bytesUserId);
            if (connectedUser.isEmpty() || !connectedUser.get().getId().equals(userId))
                return;

            var bytesUserName = Arrays.copyOfRange(packet, 17, packet.length);
            var newUserName = new String(bytesUserName);

            var oldUserName =  connectedUser.get().getName();
            connectedUser.get().setName(newUserName);
            var result = userService.updateUser(connectedUser.get());

            if (!result || connectedUser.get().getCurrentChatRoom().isEmpty())
                return;

            Optional<ChatRoom> currentChatRoom = Optional.empty();

            switch (connectedUser.get().getCurrentChatRoom().get().getOpenType()) {
                case PRIVATE:
                    currentChatRoom = chatRoomService.findPrivateRoomById(connectedUser.get().getCurrentChatRoom().get().getRoomId());
                    break;

                case PUBLIC:
                    currentChatRoom = chatRoomService.findPublicRoomById(connectedUser.get().getCurrentChatRoom().get().getRoomId());
                    break;
            }

            if (currentChatRoom.isEmpty() || currentChatRoom.get().getUsers().isEmpty())
                return;

            sendHandler.noticeRoomUserNameChanged(currentChatRoom.get(), oldUserName, newUserName);
            sendHandler.noticeRoomUsersChanged(currentChatRoom.get());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onCreateChatRoom(PacketType packetType, WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        lineNotifyService.Notify(packetType.name() + ": " + Helpers.getSessionIP(session));

        try {
            var sendCallerPacketFlag = Helpers.getPacketFlag(packetType, ErrorCreateChatRoom.NONE);
            var roomOpenType = RoomOpenType.getType(packet[1]);
            if (roomOpenType.isEmpty()) {
                sendCallerPacketFlag[1] = ErrorCreateChatRoom.NOT_ALLOWED_OPEN_TYPE.getByte();
                sessionHandler.sendOneSession(session, sendCallerPacketFlag);
                return;
            }
            var bytesUserId = Arrays.copyOfRange(packet, 2, 18);
            var bytesRoomName = Arrays.copyOfRange(packet, 18, packet.length);
            var userId = Helpers.getUUIDFromByteArray(bytesUserId);
            var roomName = new String(bytesRoomName);

            if (connectedUser.isEmpty() || connectedUser.get().getId().isEmpty()) {
                sendCallerPacketFlag[1] = ErrorCreateChatRoom.NOT_FOUND_USER.getByte();
                sessionHandler.sendOneSession(session, sendCallerPacketFlag);
                return;
            }

            if (!connectedUser.get().getId().equals(userId)) {
                sendCallerPacketFlag[1] = ErrorCreateChatRoom.NOT_MATCHED_USER.getByte();
                sessionHandler.sendOneSession(session, sendCallerPacketFlag);
                return;
            }

            var chatRoom = chatRoomService.createRoom(roomName, connectedUser.get(), roomOpenType.get());
            if (isDevelopment)
                logger.info(packetType.name() + ": " + chatRoom.getOpenType().getNumber() + ", " + chatRoom.getRoomId() + ", " + roomName + ", " + connectedUser.get().getId() + ", " + connectedUser.get().getName());

            var bytesRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
            if (0 == bytesRoomId.length) {
                sendCallerPacketFlag[1] = ErrorCreateChatRoom.REQUIRED_ROOM_ID.getByte();
                sessionHandler.sendOneSession(session, sendCallerPacketFlag);
                return;
            }

            sendHandler.sendAddChatRoom(session, chatRoom);

            var sendCallerPacket = Helpers.mergeBytePacket(sendCallerPacketFlag, bytesRoomId);
            sessionHandler.sendOneSession(session, sendCallerPacket);
            sendHandler.noticeRoomUsersChanged(chatRoom);
            lineNotifyService.Notify("채팅방 개설 (roomName:" + roomName + ", userId:" + connectedUser.get().getId() + ", userName:" + connectedUser.get().getName() + ", ip: " + Helpers.getSessionIP(session) + ")");
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onExitChatRoom(PacketType packetType, WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        if (isDevelopment)
            logger.info(packetType.name() + ": " + Helpers.getSessionIP(session));

        try {
            var sendCallerPacketFlag = Helpers.getPacketFlag(packetType, ErrorExitChatRoom.NONE);
            var roomIdBytes = Arrays.copyOfRange(packet, 1, packet.length);
            var roomId = Helpers.getUUIDFromByteArray(roomIdBytes);

            if (connectedUser.isEmpty()) {
                sendCallerPacketFlag[1] = ErrorExitChatRoom.NOT_FOUND_USER.getByte();
                sessionHandler.sendOneSession(session, sendCallerPacketFlag);
                return;
            }

            var existsRoom = chatRoomService.findPrivateRoomById(roomId);

            if (existsRoom.isEmpty())
                existsRoom = chatRoomService.findPublicRoomById(roomId);

            if (existsRoom.isEmpty()) {
                sendCallerPacketFlag[1] = ErrorExitChatRoom.NO_EXISTS_ROOM.getByte();
                sessionHandler.sendOneSession(session, sendCallerPacketFlag);
                return;
            }

            if (!existsRoom.get().getUsers().containsKey(connectedUser.get().getId())) {
                sendCallerPacketFlag[1] = ErrorExitChatRoom.NOT_IN_ROOM.getByte();
                sessionHandler.sendOneSession(session, sendCallerPacketFlag);
                return;
            }

            var callerUser = connectedUser.get();

            var resultExitRoom = chatRoomService.exitRoom(existsRoom.get(), connectedUser.get());
            if (ErrorExitChatRoom.NOT_IN_ROOM == resultExitRoom || ErrorExitChatRoom.NO_EXISTS_ROOM == resultExitRoom) {
                sendCallerPacketFlag[1] = ErrorExitChatRoom.FAILED_TO_EXIT.getByte();
                sessionHandler.sendOneSession(session, sendCallerPacketFlag);
                return;
            }

            connectedUser.ifPresent(old -> old.setCurrentChatRoom(Optional.empty()));
            sessionHandler.sendOneSession(session, sendCallerPacketFlag);
            sendHandler.noticeRoomUserExited(existsRoom.get(), connectedUser.get().getName());
            sendHandler.noticeRoomUsersChanged(existsRoom.get());

            messageService.notifyBrowserUserInRoom(existsRoom.get(), "채팅방 퇴장", "'" + callerUser.getName() + "'님이 대화방에 퇴장했습니다.");
            lineNotifyService.Notify("채팅방 퇴장 (roomName:" + existsRoom.get().getRoomName() + ", userName:" + callerUser.getName() + ", ip: " + Helpers.getSessionIP(session) + ")");
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onEnterChatRoom(PacketType packetType, WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        if (isDevelopment)
            logger.info(packetType.name() + ": " + Helpers.getSessionIP(session));

        try {
            var sendCallerPacketFlag = Helpers.getPacketFlag(packetType, ErrorEnterChatRoom.NONE);
            if (connectedUser.isEmpty() || connectedUser.get().getId().isEmpty()) {
                sendCallerPacketFlag[1] = ErrorEnterChatRoom.NOT_FOUND_USER.getByte();
                sessionHandler.sendOneSession(session, sendCallerPacketFlag);
                return;
            }

            var bytesRoomId = Arrays.copyOfRange(packet, 1, 17);
            var roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
            var existsRoom = chatRoomService.findPrivateRoomById(roomId);

            if (existsRoom.isEmpty())
                existsRoom = chatRoomService.findPublicRoomById(roomId);

            if (existsRoom.isEmpty()) {
                sendCallerPacketFlag[1] = ErrorEnterChatRoom.NO_EXISTS_ROOM.getByte();
                sessionHandler.sendOneSession(session, sendCallerPacketFlag);
                return;
            }

            if (existsRoom.get().getUsers().containsKey(connectedUser.get().getId())) {
                sendCallerPacketFlag[1] = ErrorEnterChatRoom.ALREADY_IN_ROOM.getByte();
                sessionHandler.sendOneSession(session, sendCallerPacketFlag);
                return;
            }

            var bytesUserId = Arrays.copyOfRange(packet, 17, packet.length);
            var userId = Helpers.getUUIDFromByteArray(bytesUserId);

            if (!connectedUser.get().getId().equals(userId)) {
                sendCallerPacketFlag[1] = ErrorEnterChatRoom.ALREADY_IN_ROOM.getByte();
                sessionHandler.sendOneSession(session, sendCallerPacketFlag);
                return;
            }

            if (existsRoom.get().checkUserInRoom(userId)) {
                sendCallerPacketFlag[1] = ErrorEnterChatRoom.ALREADY_IN_ROOM.getByte();
                sessionHandler.sendOneSession(session, sendCallerPacketFlag);
                return;
            }

            // 채팅방 메모리에 유저 정보 추가
            existsRoom.get().addUserToRoom(connectedUser.get());
            // 유저 메모리에 채팅방 정보 추가
            connectedUser.get().setCurrentChatRoom(Optional.of(existsRoom.get().getInfo()));
            userService.addUserChatRoomInfo(connectedUser.get().getId(), existsRoom.get());

            sendHandler.sendAddChatRoom(existsRoom.get());

            var sendCallerPacket = Helpers.mergeBytePacket(sendCallerPacketFlag, bytesRoomId);
            sessionHandler.sendOneSession(session, sendCallerPacket);

            var sendNoticePacketFlag = Helpers.getPacketFlag(PacketType.NOTICE_ENTER_CHAT_ROOM);
            var sendNoticePacket = Helpers.mergeBytePacket(sendNoticePacketFlag, bytesRoomId, connectedUser.get().getName().getBytes());

            sessionHandler.sendEachSessionInRoom(existsRoom.get(), sendNoticePacket);
            sendHandler.noticeRoomUsersChanged(existsRoom.get());

            var chatHistoryCount = existsRoom.get().getChats().size();
            if (0 < chatHistoryCount) {
                var sendHistoryPacketFlag = Helpers.getPacketFlag(PacketType.HISTORY_CHAT_ROOM);
                var bytesHistoryCount = Helpers.getByteArrayFromInt(chatHistoryCount);
                var bytesHistoryRoomId = Helpers.getByteArrayFromUUID(roomId);
                var bytesHistoryChatId = new byte[0];
                var bytesHistoryUserId = new byte[0];
                var bytesHistoryChatType = new byte[0];
                var bytesHistorySendAt = new byte[0];
                var bytesHistoryUserNameLength = new byte[0];
                var bytesHistoryMessageLength = new byte[0];
                var bytesHistoryUserName = new byte[0];
                var bytesHistoryMessage = new byte[0];

                for (Chat chat : existsRoom.get().getChats()) {
                    bytesHistoryChatId = Helpers.mergeBytePacket(bytesHistoryChatId, Helpers.getByteArrayFromUUID(chat.getChatId()));
                    bytesHistoryUserId = Helpers.mergeBytePacket(bytesHistoryUserId, Helpers.getByteArrayFromUUID(chat.getUserId()));
                    bytesHistoryChatType = Helpers.mergeBytePacket(bytesHistoryChatType, new byte[] {chat.getType().getByte()});
                    bytesHistorySendAt = Helpers.mergeBytePacket(bytesHistorySendAt, Helpers.getByteArrayFromLong(chat.getSendAt().getTime()));
                    bytesHistoryUserNameLength = Helpers.mergeBytePacket(bytesHistoryUserNameLength, new byte[] {(byte)chat.getUserName().getBytes().length});
                    bytesHistoryMessageLength = Helpers.mergeBytePacket(bytesHistoryMessageLength, Helpers.getByteArrayFromInt(chat.getMessage().getBytes().length));
                    bytesHistoryUserName = Helpers.mergeBytePacket(bytesHistoryUserName, chat.getUserName().getBytes());
                    bytesHistoryMessage = Helpers.mergeBytePacket(bytesHistoryMessage, chat.getMessage().getBytes());
                }

                var sendChatHistoryPacket = Helpers.mergeBytePacket(
                        sendHistoryPacketFlag,
                        bytesHistoryCount,
                        bytesHistoryRoomId,
                        bytesHistoryChatId,
                        bytesHistoryUserId,
                        bytesHistoryChatType,
                        bytesHistorySendAt,
                        bytesHistoryUserNameLength,
                        bytesHistoryMessageLength,
                        bytesHistoryUserName,
                        bytesHistoryMessage
                );
                sessionHandler.sendOneSession(session, sendChatHistoryPacket);
            }

            messageService.notifyBrowserUserInRoom(existsRoom.get(), "채팅방 입장", "'" + connectedUser.get().getName() + "'님이 대화방에 입장했습니다.");
            lineNotifyService.Notify("채팅방 입장 (roomName:" + existsRoom.get().getRoomName() + ", userId:" + connectedUser.get().getId() + ", userName:" + connectedUser.get().getName() + ", ip: " + Helpers.getSessionIP(session) + ")");
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onTalkChatRoom(PacketType packetType, WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        if (isDevelopment)
            logger.info(packetType.name() + ": " + Helpers.getSessionIP(session));

        try {
            var sendPacketFlag = Helpers.getPacketFlag(packetType, ErrorTalkChatRoom.NONE);
            var chatOptType = ChatType.getType(packet[1]);
            if (chatOptType.isEmpty()) {
                sendPacketFlag[1] = ErrorTalkChatRoom.NOT_AVAILABLE_CHAT_TYPE.getByte();
                sessionHandler.sendOneSession(session, sendPacketFlag);
                return;
            }

            var chatType = chatOptType.get();

            var bytesChatId = Arrays.copyOfRange(packet, 2, 18);
            var chatId = Helpers.getUUIDFromByteArray(bytesChatId);

            var bytesRoomId = Arrays.copyOfRange(packet, 18, 34);
            var roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
            var existsRoom = chatRoomService.findPrivateRoomById(roomId);
            if (existsRoom.isEmpty())
                existsRoom = chatRoomService.findPublicRoomById(roomId);

            if (existsRoom.isEmpty()) {
                sendPacketFlag[1] = ErrorTalkChatRoom.NO_EXISTS_ROOM.getByte();
                sessionHandler.sendOneSession(session, sendPacketFlag);
                return;
            }

            var userRoom = existsRoom.get().getUserRoom(connectedUser.get());

            if (null == userRoom) {
                sendPacketFlag[1] = ErrorTalkChatRoom.NOT_IN_ROOM.getByte();
                sessionHandler.sendOneSession(session, sendPacketFlag);
                return;
            }

            var bytesUserId = Arrays.copyOfRange(packet, 34, 50);
            var userId = Helpers.getUUIDFromByteArray(bytesUserId);

            if (connectedUser.isEmpty() || connectedUser.get().getId().isEmpty()) {
                sendPacketFlag[1] = ErrorTalkChatRoom.NOT_FOUND_USER.getByte();
                sessionHandler.sendOneSession(session, sendPacketFlag);
                return;
            }

            if (!userRoom.getUserId().equals(userId)) {
                sendPacketFlag[1] = ErrorTalkChatRoom.NOT_MATCHED_USER.getByte();
                sessionHandler.sendOneSession(session, sendPacketFlag);
                return;
            }

            var userName = connectedUser.get().getName();
            var bytesUserName = userName.getBytes();
            var bytesUserNameBytesLength = new byte[] {(byte)bytesUserName.length};
            var bytesChatMessageBytesLength = Arrays.copyOfRange(packet, 50, 54);
            var chatMessageBytesLength = Helpers.getIntFromByteArray(bytesChatMessageBytesLength);
            var bytesChatMessage = Arrays.copyOfRange(packet, 54, 54 + chatMessageBytesLength);
            var chatMessage = new String(bytesChatMessage);
            var sendAt = new Date();
            var bytesNow = Helpers.getByteArrayFromLong(sendAt.getTime());
            var chat = new Chat(chatId, roomId, userId, userName, chatType, chatMessage, sendAt);
            if (isDevelopment && ChatType.IMAGE != chatType)
                logger.info(packetType.name() + ": " + chatType + ", " + roomId + ", " + userId + ", " + userName + ", " + chatMessage + ", " + sendAt + ", " + chatId);

            var sendRoomPacket = Helpers.mergeBytePacket(
                    sendPacketFlag,
                    (new byte[]{chatType.getByte()}),
                    bytesRoomId,
                    bytesUserId,
                    bytesChatId,
                    bytesNow,
                    (bytesUserNameBytesLength),
                    bytesChatMessageBytesLength,
                    bytesUserName,
                    bytesChatMessage
            );
            sessionHandler.sendEachSessionInRoom(existsRoom.get(), sendRoomPacket);
            messageService.notifyBrowserUserInRoom(existsRoom.get(), userName, chatMessage);
            chatRoomService.addChatToRoom(chat);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }
}
