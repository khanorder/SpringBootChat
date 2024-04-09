package com.zangho.game.server.socketHandler.chat;

import com.zangho.game.server.define.*;
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

public class ReqHandler {

    private final Logger logger = LoggerFactory.getLogger(ResHandler.class);
    private final boolean isDevelopment;
    private final SessionHandler sessionHandler;
    private final ResHandler resHandler;
    private final UserService userService;
    private final ChatRoomService chatRoomService;
    private final LineNotifyService lineNotifyService;
    private final MessageService messageService;

    public ReqHandler(SessionHandler sessionHandler, ResHandler resHandler, UserService userService, ChatRoomService chatRoomService, LineNotifyService lineNotifyService, MessageService messageService) {
        var config = System.getProperty("Config");
        isDevelopment = null == config || !config.equals("production");
        this.sessionHandler = sessionHandler;
        this.resHandler = resHandler;
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
                            resHandler.noticeRoomUserExited(chatRoom, user.get());
                            resHandler.noticeRoomUsersChanged(chatRoom);
                        }
                    } catch (Exception ex) {
                        logger.error(ex.getMessage(), ex);
                    }
                }

                // 연결된 유저 정보 제거
                userService.removeConnectedUser(user.get());
                // 연결종료 전체알림
                resHandler.noticeDisconnectedUser(closeSession, user.get());
            }

            // 세션제거
            sessionHandler.removeSession(closeSession);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
        sessionHandler.consoleLogState("disconnected");
        lineNotifyService.Notify("채팅샘플 접속종료 (" + Helpers.getSessionIP(closeSession) + ")");
    }

    public void onCheckConnection(ReqType reqType, WebSocketSession session, byte[] packet) {
        if (isDevelopment)
            logger.info(reqType.name() + ": " + Helpers.getSessionIP(session));

    }

    public void onCheckAuthentication(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            if (connectedUser.isPresent()) {
                resHandler.resCheckAuthentication(session, ErrorCheckAuth.ALREADY_SIGN_IN_USER);
                return;
            }

            Optional<User> optUser = Optional.empty();
            List<ChatRoomInfoInterface> chatRooms = new ArrayList<>();
            if (17 == packet.length) {
                var bytesUserId = Arrays.copyOfRange(packet, 1, 17);
                var userId = Helpers.getUUIDFromByteArray(bytesUserId);
                if (userService.isConnectedUser(userId)) {
                    resHandler.resCheckAuthentication(session, ErrorCheckAuth.ALREADY_SIGN_IN_USER);
                    return;
                }

                var authenticatedUserInfo = userService.authenticateUser(userId, session);
                optUser = authenticatedUserInfo.getLeft();
                chatRooms = authenticatedUserInfo.getRight();
            }

            if (optUser.isEmpty()) {
                optUser = userService.createTempUser(session);
                if (optUser.isEmpty()) {
                    resHandler.resCheckAuthentication(session, ErrorCheckAuth.FAILED_TO_CREATE_USER);
                    return;
                }
            }

            // 팔로우, 팔로워, 사용 가능한 채팅방 정보 전달
            resHandler.resCheckAuthentication(session, optUser.get(), chatRooms);
            resHandler.resConnectedUsers(session);

            // 접속 전체알림
            resHandler.noticeConnectedUser(session, optUser.get());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onConnectedUsers(WebSocketSession session) {
        try {
            resHandler.resConnectedUsers(session);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onFollow(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            var bytesUserId = Arrays.copyOfRange(packet, 1, 17);
            var userId = Helpers.getUUIDFromByteArray(bytesUserId);

            if (connectedUser.isEmpty()) {
                resHandler.resFollow(session, ErrorFollow.AUTH_REQUIRED);
                return;
            }

            var targetUser = userService.findOnlyUser(userId);
            if (targetUser.isEmpty()) {
                resHandler.resFollow(session, ErrorFollow.NOT_FOUND_USER);
                return;
            }

            if (targetUser.get().getId().equals(connectedUser.get().getId())) {
                resHandler.resFollow(session, ErrorFollow.CAN_NOT_FOLLOW_SELF);
                return;
            }

            var exists = userService.findFollower(connectedUser.get(), targetUser.get());
            if (exists.isPresent()) {
                resHandler.resFollow(session, ErrorFollow.ALREADY_FOLLOWED);
                return;
            }

            var follow = userService.followUser(connectedUser.get(), targetUser.get());
            if (follow.isEmpty()) {
                resHandler.resFollow(session, ErrorFollow.FAILED_TO_FOLLOW);
                return;
            }

            resHandler.resFollow(session, targetUser.get());
            resHandler.resFollower(targetUser.get(), connectedUser.get());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onUnfollow(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            var bytesUserId = Arrays.copyOfRange(packet, 1, 17);
            var userId = Helpers.getUUIDFromByteArray(bytesUserId);

            if (connectedUser.isEmpty()) {
                resHandler.resUnfollow(session, ErrorUnfollow.AUTH_REQUIRED);
                return;
            }

            var targetUser = userService.findOnlyUser(userId);
            if (targetUser.isEmpty()) {
                resHandler.resUnfollow(session, ErrorUnfollow.NOT_FOUND_USER);
                return;
            }

            if (targetUser.get().getId().equals(connectedUser.get().getId())) {
                resHandler.resUnfollow(session, ErrorUnfollow.CAN_NOT_UNFOLLOW_SELF);
                return;
            }

            var exists = userService.findFollower(connectedUser.get(), targetUser.get());
            if (exists.isEmpty()) {
                resHandler.resUnfollow(session, ErrorUnfollow.NOT_FOUND_FOLLOWED);
                return;
            }

            var result = userService.unfollowUser(exists.get());
            if (!result) {
                resHandler.resUnfollow(session, ErrorUnfollow.FAILED_TO_UNFOLLOW);
                return;
            }

            resHandler.resUnfollow(session, targetUser.get());
            resHandler.resUnfollower(targetUser.get(), connectedUser.get());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onChangeUserName(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
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

            resHandler.noticeRoomUserNameChanged(currentChatRoom.get(), oldUserName, newUserName);
            resHandler.noticeRoomUsersChanged(currentChatRoom.get());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onCreateChatRoom(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            var roomOpenType = RoomOpenType.getType(packet[1]);
            if (roomOpenType.isEmpty()) {
                resHandler.resCreateChatRoom(session, ErrorCreateChatRoom.NOT_ALLOWED_OPEN_TYPE);
                return;
            }
            var bytesUserId = Arrays.copyOfRange(packet, 2, 18);
            var bytesRoomName = Arrays.copyOfRange(packet, 18, packet.length);
            var userId = Helpers.getUUIDFromByteArray(bytesUserId);
            var roomName = new String(bytesRoomName);

            if (connectedUser.isEmpty() || connectedUser.get().getId().isEmpty()) {
                resHandler.resCreateChatRoom(session, ErrorCreateChatRoom.NOT_FOUND_USER);
                return;
            }

            if (!connectedUser.get().getId().equals(userId)) {
                resHandler.resCreateChatRoom(session, ErrorCreateChatRoom.NOT_MATCHED_USER);
                return;
            }

            var chatRoom = chatRoomService.createRoom(roomName, connectedUser.get(), roomOpenType.get());
            if (isDevelopment)
                logger.info(chatRoom.getOpenType().getNumber() + ", " + chatRoom.getRoomId() + ", " + roomName + ", " + connectedUser.get().getId() + ", " + connectedUser.get().getName());

            var bytesRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
            if (0 == bytesRoomId.length) {
                resHandler.resCreateChatRoom(session, ErrorCreateChatRoom.REQUIRED_ROOM_ID);
                return;
            }

            resHandler.sendAddChatRoom(session, chatRoom);
            resHandler.resCreateChatRoom(session, ErrorCreateChatRoom.NONE);
            resHandler.noticeRoomUsersChanged(chatRoom);
            lineNotifyService.Notify("채팅방 개설 (roomName:" + roomName + ", userId:" + connectedUser.get().getId() + ", userName:" + connectedUser.get().getName() + ", ip: " + Helpers.getSessionIP(session) + ")");
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onEnterChatRoom(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            if (connectedUser.isEmpty() || connectedUser.get().getId().isEmpty()) {
                resHandler.resEnterChatRoom(session, ErrorEnterChatRoom.NOT_FOUND_USER);
                return;
            }

            var bytesRoomId = Arrays.copyOfRange(packet, 1, 17);
            var roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
            var existsRoom = chatRoomService.findPrivateRoomById(roomId);

            if (existsRoom.isEmpty())
                existsRoom = chatRoomService.findPublicRoomById(roomId);

            if (existsRoom.isEmpty()) {
                resHandler.resEnterChatRoom(session, ErrorEnterChatRoom.NO_EXISTS_ROOM);
                return;
            }

            if (existsRoom.get().getUsers().containsKey(connectedUser.get().getId())) {
                resHandler.resEnterChatRoom(session, ErrorEnterChatRoom.ALREADY_IN_ROOM);
                return;
            }

            var bytesUserId = Arrays.copyOfRange(packet, 17, packet.length);
            var userId = Helpers.getUUIDFromByteArray(bytesUserId);

            if (!connectedUser.get().getId().equals(userId)) {
                resHandler.resEnterChatRoom(session, ErrorEnterChatRoom.ALREADY_IN_ROOM);
                return;
            }

            if (existsRoom.get().checkUserInRoom(userId)) {
                resHandler.resEnterChatRoom(session, ErrorEnterChatRoom.ALREADY_IN_ROOM);
                return;
            }

            // 채팅방 메모리에 유저 정보 추가
            existsRoom.get().addUserToRoom(connectedUser.get());
            // 유저 메모리에 채팅방 정보 추가
            connectedUser.get().setCurrentChatRoom(Optional.of(existsRoom.get().getInfo()));
            userService.addUserChatRoomInfo(connectedUser.get().getId(), existsRoom.get());

            resHandler.sendAddChatRoom(existsRoom.get());
            resHandler.resEnterChatRoom(session, existsRoom.get());
            resHandler.noticeEnterChatRoom(existsRoom.get(), connectedUser.get());
            resHandler.noticeRoomUsersChanged(existsRoom.get());
            resHandler.resHistoryChatRoom(session, existsRoom.get());

            messageService.notifyBrowserUserInRoom(existsRoom.get(), "채팅방 입장", "'" + connectedUser.get().getName() + "'님이 대화방에 입장했습니다.");
            lineNotifyService.Notify("채팅방 입장 (roomName:" + existsRoom.get().getRoomName() + ", userId:" + connectedUser.get().getId() + ", userName:" + connectedUser.get().getName() + ", ip: " + Helpers.getSessionIP(session) + ")");
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onExitChatRoom(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            var roomIdBytes = Arrays.copyOfRange(packet, 1, packet.length);
            var roomId = Helpers.getUUIDFromByteArray(roomIdBytes);

            if (connectedUser.isEmpty()) {
                resHandler.resExitChatRoom(session, ErrorExitChatRoom.NOT_FOUND_USER);
                return;
            }

            var existsRoom = chatRoomService.findPrivateRoomById(roomId);

            if (existsRoom.isEmpty())
                existsRoom = chatRoomService.findPublicRoomById(roomId);

            if (existsRoom.isEmpty()) {
                resHandler.resExitChatRoom(session, ErrorExitChatRoom.NO_EXISTS_ROOM);
                return;
            }

            if (!existsRoom.get().getUsers().containsKey(connectedUser.get().getId())) {
                resHandler.resExitChatRoom(session, ErrorExitChatRoom.NOT_IN_ROOM);
                return;
            }

            var callerUser = connectedUser.get();

            var resultExitRoom = chatRoomService.exitRoom(existsRoom.get(), connectedUser.get());
            if (ErrorExitChatRoom.NOT_IN_ROOM == resultExitRoom || ErrorExitChatRoom.NO_EXISTS_ROOM == resultExitRoom) {
                resHandler.resExitChatRoom(session, ErrorExitChatRoom.FAILED_TO_EXIT);
                return;
            }

            connectedUser.ifPresent(old -> old.setCurrentChatRoom(Optional.empty()));
            resHandler.resExitChatRoom(session, ErrorExitChatRoom.NONE);
            resHandler.noticeRoomUserExited(existsRoom.get(), connectedUser.get());
            resHandler.noticeRoomUsersChanged(existsRoom.get());

            messageService.notifyBrowserUserInRoom(existsRoom.get(), "채팅방 퇴장", "'" + callerUser.getName() + "'님이 대화방에 퇴장했습니다.");
            lineNotifyService.Notify("채팅방 퇴장 (roomName:" + existsRoom.get().getRoomName() + ", userName:" + callerUser.getName() + ", ip: " + Helpers.getSessionIP(session) + ")");
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onTalkChatRoom(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            var chatOptType = ChatType.getType(packet[1]);
            if (chatOptType.isEmpty()) {
                resHandler.resTalkChatRoom(session, ErrorTalkChatRoom.NOT_AVAILABLE_CHAT_TYPE);
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
                resHandler.resTalkChatRoom(session, ErrorTalkChatRoom.NO_EXISTS_ROOM);
                return;
            }

            var userRoom = existsRoom.get().getUserRoom(connectedUser.get());

            if (null == userRoom) {
                resHandler.resTalkChatRoom(session, ErrorTalkChatRoom.NOT_IN_ROOM);
                return;
            }

            var bytesUserId = Arrays.copyOfRange(packet, 34, 50);
            var userId = Helpers.getUUIDFromByteArray(bytesUserId);

            if (connectedUser.get().getId().isEmpty()) {
                resHandler.resTalkChatRoom(session, ErrorTalkChatRoom.NOT_FOUND_USER);
                return;
            }

            if (!userRoom.getUserId().equals(userId)) {
                resHandler.resTalkChatRoom(session, ErrorTalkChatRoom.NOT_MATCHED_USER);
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
                logger.info(chatType + ", " + roomId + ", " + userId + ", " + userName + ", " + chatMessage + ", " + sendAt + ", " + chatId);

            var talkPacket = Helpers.mergeBytePacket(
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
            resHandler.noticeTalkChatRoom(existsRoom.get(), talkPacket);
            messageService.notifyBrowserUserInRoom(existsRoom.get(), userName, chatMessage);
            chatRoomService.addChatToRoom(chat);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }
}