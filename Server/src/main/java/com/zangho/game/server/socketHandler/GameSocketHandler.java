package com.zangho.game.server.socketHandler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zangho.game.server.define.*;
import com.zangho.game.server.domain.chat.*;
import com.zangho.game.server.domain.user.*;
import com.zangho.game.server.error.*;
import com.zangho.game.server.helper.Helpers;
import com.zangho.game.server.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.nio.ByteBuffer;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class GameSocketHandler extends TextWebSocketHandler {

    private final Logger logger = LoggerFactory.getLogger(GameSocketHandler.class);
    private final UserService userService;
    private final ChatService chatService;
    private final ChatImageService chatImageService;
    private final ChatRoomService chatRoomService;
    private final LineNotifyService lineNotifyService;
    private final MessageService messageService;
    private final ConcurrentHashMap<WebSocketSession, Optional<User>> connectedSessions;
    private final boolean isDevelopment;

    public GameSocketHandler(
            UserService userService,
            ChatService chatService,
            ChatImageService chatImageService,
            ChatRoomService chatRoomService,
            LineNotifyService lineNotifyService,
            MessageService messageService
    ) {
        this.userService = userService;
        this.chatService = chatService;
        this.chatImageService = chatImageService;
        this.chatRoomService = chatRoomService;
        this.lineNotifyService = lineNotifyService;
        this.messageService = messageService;
        this.connectedSessions = new ConcurrentHashMap<>();
        var config = System.getProperty("Config");
        isDevelopment = null == config || !config.equals("production");
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        connectedSessions.put(session, Optional.empty());
        sendToOne(session, getPacketUpdatePublicChatRooms());
        consoleLogConnectionState();
        if (isDevelopment)
            logger.info("connected");

        lineNotifyService.Notify("채팅샘플 접속 (" + Helpers.getSessionIP(session) + ")");
        super.afterConnectionEstablished(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession closeSession, CloseStatus status) throws Exception {
        var chatRooms = new ArrayList<ChatRoom>();
        for (var chatRoom : chatRoomService.findAllPublicChatRooms()) {
            if (chatRoom.getSessions().containsKey(closeSession))
                chatRooms.add(chatRoom);
        }

        var user = connectedSessions.get(closeSession);
        if (user.isPresent()) {
            for (var chatRoom : chatRoomService.findAllPrivateChatRoomsByUserId(user.get().getId())) {
                if (chatRoom.getSessions().containsKey(closeSession))
                    chatRooms.add(chatRoom);
            }
        }

        exitAllRooms(closeSession);
        for (ChatRoom chatRoom : chatRooms) {
            sendEachSessionUpdateChatRoom(chatRoom);
        }
        //sendToAll(getPacketUpdatePublicChatRooms());
        connectedSessions.remove(closeSession);
        consoleLogConnectionState();
        lineNotifyService.Notify("채팅샘플 접속종료 (" + Helpers.getSessionIP(closeSession) + ")");
        super.afterConnectionClosed(closeSession, status);
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
        consoleLogConnectionState();
        var sessionUser = connectedSessions.get(session);
        var payload = message.getPayload();
        if (!payload.hasArray())
            return;

        var packet = payload.array();

        if (1 > packet.length)
            return;

        var optType = PacketType.getType(packet[0]);
        if (optType.isEmpty())
            return;

        var type = optType.get();

        switch (type) {
            case CHECK_CONNECTION:
                try {
                    if (isDevelopment)
                        logger.info("CHECK_CONNECTION: " + Helpers.getSessionIP(session));
                } catch (Exception ex) {
                    logger.error(ex.getMessage(), ex);
                }
                break;

            case CHECK_AUTHENTICATION:
                try {
                    if (isDevelopment)
                        logger.info("CHECK_AUTHENTICATION: " + Helpers.getSessionIP(session));

                    var sendCallerPacketFlag = new byte[] {type.getByte(), ErrorCheckAuthentication.NONE.getByte()};
                    Optional<User> user = Optional.empty();
                    if (17 == packet.length) {
                        var bytesUserId = Arrays.copyOfRange(packet, 1, 17);
                        var userId = Helpers.getUUIDFromByteArray(bytesUserId);
                        if (connectedSessions.values().stream().anyMatch(exists -> exists.isPresent() && exists.get().getId().equals(userId))) {
                            sendCallerPacketFlag = new byte[] {type.getByte(), ErrorCheckAuthentication.ALREADY_SIGN_IN_USER.getByte()};
                            sendToOne(session, sendCallerPacketFlag);
                            break;
                        }
                        user = userService.findUser(userId);
                    }

                    if (user.isEmpty()) {
                        user = userService.createNewUser();
                        if (user.isEmpty()) {
                            sendCallerPacketFlag = new byte[] {type.getByte(), ErrorCheckAuthentication.FAILED_TO_CREATE_USER.getByte()};
                            sendToOne(session, sendCallerPacketFlag);
                            consoleLogBytePackets(sendCallerPacketFlag, "failed create user");
                            break;
                        }
                    }

                    user.ifPresent(old -> old.setCurrentChatRoom(Optional.empty()));
                    var finalUser = user;
                    connectedSessions.computeIfPresent(session, (key, old) -> finalUser);

                    var bytesUserId = Helpers.getByteArrayFromUUID(user.get().getId());
                    var bytesUserName = user.get().getName().getBytes();
                    var sendCallerBuffer = ByteBuffer.allocate(sendCallerPacketFlag.length + bytesUserId.length + bytesUserName.length);
                    sendCallerBuffer.put(sendCallerPacketFlag);
                    sendCallerBuffer.put(bytesUserId);
                    sendCallerBuffer.put(bytesUserName);
                    sendToOne(session, sendCallerBuffer.array());
                } catch (Exception ex) {
                    logger.error(ex.getMessage(), ex);
                }
                break;

            case CHANGE_USER_NAME:
                try {
                    if (isDevelopment)
                        logger.info("CHANGE_USER_NAME: " + Helpers.getSessionIP(session));

                    var bytesUserId = Arrays.copyOfRange(packet, 1, 17);
                    var userId = Helpers.getUUIDFromByteArray(bytesUserId);
                    if (sessionUser.isEmpty() || !sessionUser.get().getId().equals(userId))
                        return;

                    var bytesUserName = Arrays.copyOfRange(packet, 17, packet.length);
                    var newUserName = new String(bytesUserName);

                    var oldUserName =  sessionUser.get().getName();
                    sessionUser.get().setName(newUserName);
                    var result = userService.updateUser(sessionUser.get());
                    if (result && sessionUser.get().getCurrentChatRoom().isPresent()) {
                        Optional<ChatRoom> currentChatRoom = Optional.empty();

                        switch (sessionUser.get().getCurrentChatRoom().get().getOpenType()) {
                            case PRIVATE:
                                currentChatRoom = chatRoomService.findPrivateRoomById(sessionUser.get().getCurrentChatRoom().get().getRoomId());
                                break;

                            case PUBLIC:
                                currentChatRoom = chatRoomService.findPublicRoomById(sessionUser.get().getCurrentChatRoom().get().getRoomId());
                                break;
                        }

                        if (currentChatRoom.isPresent() && !currentChatRoom.get().getSessions().isEmpty()) {
                            noticeChangeUserNameChatRoom(currentChatRoom.get(), oldUserName, newUserName);
                            sendEachSessionUpdateChatRoom(currentChatRoom.get());
                        }
                    }
                } catch (Exception ex) {
                    logger.error(ex.getMessage(), ex);
                }
                break;

            case CREATE_CHAT_ROOM:
                lineNotifyService.Notify("CREATE_CHAT_ROOM: " + Helpers.getSessionIP(session));
                try {
                    var sendCallerPacketFlag = new byte[] {type.getByte(), ErrorCreateChatRoom.NONE.getByte()};
                    var roomOpenType = RoomOpenType.getType(packet[1]);
                    if (roomOpenType.isEmpty()) {
                        sendCallerPacketFlag[1] = ErrorCreateChatRoom.NOT_ALLOWED_OPEN_TYPE.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }
                    var bytesUserId = Arrays.copyOfRange(packet, 2, 18);
                    var bytesRoomName = Arrays.copyOfRange(packet, 18, packet.length);
                    var userId = Helpers.getUUIDFromByteArray(bytesUserId);
                    var roomName = new String(bytesRoomName);

                    var user = userService.findUser(userId);
                    if (user.isEmpty()) {
                        sendCallerPacketFlag[1] = ErrorCreateChatRoom.NOT_FOUND_USER.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }

                    if (sessionUser.isEmpty()) {
                        sendCallerPacketFlag[1] = ErrorCreateChatRoom.NOT_FOUND_USER.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }

                    var chatRoom = chatRoomService.createRoom(roomName, session, user.get(), roomOpenType.get());
                    if (isDevelopment)
                        logger.info("CREATE_CHAT_ROOM: " + chatRoom.getOpenType().getNumber() + ", " + chatRoom.getRoomId() + ", " + roomName + ", " + user.get().getId() + ", " + user.get().getName());

                    var bytesRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
                    if (0 == bytesRoomId.length) {
                        sendCallerPacketFlag[1] = ErrorCreateChatRoom.REQUIRED_ROOM_ID.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }

                    var addChatRoomPacket = getAddChatRoomPackets(chatRoom);
                    switch (chatRoom.getOpenType()) {
                        case PRIVATE:
                            sendToOne(session, addChatRoomPacket);
                            break;

                        case PUBLIC:
                            sendToAll(addChatRoomPacket);
                            break;
                    }

                    var sendCallerPacket = mergeBytePacket(sendCallerPacketFlag, bytesRoomId);
                    sendToOne(session, sendCallerPacket);
                    sendEachSessionUpdateChatRoom(chatRoom);
                    sessionUser.get().setCurrentChatRoom(Optional.of(chatRoom.getInfo()));
                    lineNotifyService.Notify("채팅방 개설 (roomName:" + roomName + ", userId:" + user.get().getId() + ", userName:" + user.get().getName() + ", ip: " + Helpers.getSessionIP(session) + ")");
                } catch (Exception ex) {
                    logger.error(ex.getMessage(), ex);
                }
                break;

            case EXIT_CHAT_ROOM:
                try {
                    var sendCallerPacketFlag = new byte[] {type.getByte(), ErrorExitChatRoom.NONE.getByte()};
                    var roomIdBytes = Arrays.copyOfRange(packet, 1, packet.length);
                    var roomId = Helpers.getUUIDFromByteArray(roomIdBytes);

                    if (sessionUser.isEmpty()) {
                        sendCallerPacketFlag[1] = ErrorExitChatRoom.NOT_FOUND_USER.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }

                    var existsRoom = chatRoomService.findPrivateRoomById(roomId);

                    if (existsRoom.isEmpty())
                        existsRoom = chatRoomService.findPublicRoomById(roomId);

                    if (existsRoom.isEmpty()) {
                        sendCallerPacketFlag[1] = ErrorExitChatRoom.NO_EXISTS_ROOM.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }

                    if (!existsRoom.get().getSessions().containsKey(session)) {
                        sendCallerPacketFlag[1] = ErrorExitChatRoom.NOT_IN_ROOM.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }

                    var callerUser = sessionUser.get();

                    var resultExitRoom = chatRoomService.exitRoom(roomId, session);
                    if (ErrorExitChatRoom.NOT_IN_ROOM == resultExitRoom || ErrorExitChatRoom.NO_EXISTS_ROOM == resultExitRoom) {
                        sendCallerPacketFlag[1] = ErrorExitChatRoom.FAILED_TO_EXIT.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }

                    sessionUser.ifPresent(old -> old.setCurrentChatRoom(Optional.empty()));
                    sendToOne(session, sendCallerPacketFlag);
                    noticeUserExitChatRoom(existsRoom.get(), sessionUser.get().getName());
                    sendEachSessionUpdateChatRoom(existsRoom.get());

                    if (ErrorExitChatRoom.ROOM_REMOVED == resultExitRoom) {
                        var removeChatRoomPacket = getRemoveChatRoomPackets(roomId);

                        switch (existsRoom.get().getOpenType()) {
                            case PRIVATE:
                                break;

                            case PUBLIC:
                                sendToAll(removeChatRoomPacket);
                                break;
                        }
                    }

                    notifyBrowserUserInRoom(existsRoom.get(), "채팅방 퇴장", "'" + callerUser.getName() + "'님이 대화방에 퇴장했습니다.");
                    lineNotifyService.Notify("채팅방 퇴장 (roomName:" + existsRoom.get().getRoomName() + ", userName:" + callerUser.getName() + ", ip: " + Helpers.getSessionIP(session) + ")");
                } catch (Exception ex) {
                    logger.error(ex.getMessage(), ex);
                }
                break;

            case ENTER_CHAT_ROOM:
                try {
                    var sendCallerPacketFlag = new byte[] {type.getByte(), ErrorEnterChatRoom.NONE.getByte()};
                    if (sessionUser.isEmpty()) {
                        sendCallerPacketFlag[1] = ErrorEnterChatRoom.NOT_FOUND_USER.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }

                    var bytesRoomId = Arrays.copyOfRange(packet, 1, 17);
                    var roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                    var existsRoom = chatRoomService.findPrivateRoomById(roomId);

                    if (existsRoom.isEmpty())
                        existsRoom = chatRoomService.findPublicRoomById(roomId);

                    if (existsRoom.isEmpty()) {
                        sendCallerPacketFlag[1] = ErrorEnterChatRoom.NO_EXISTS_ROOM.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }

                    if (existsRoom.get().getSessions().containsKey(session)) {
                        sendCallerPacketFlag[1] = ErrorEnterChatRoom.ALREADY_IN_ROOM.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }

                    var bytesUserId = Arrays.copyOfRange(packet, 17, packet.length);
                    var userId = Helpers.getUUIDFromByteArray(bytesUserId);
                    var user = userService.findUser(userId);
                    if (user.isEmpty()) {
                        sendCallerPacketFlag[1] = ErrorEnterChatRoom.NOT_FOUND_USER.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }

                    if (existsRoom.get().checkUserInRoom(userId)) {
                        sendCallerPacketFlag[1] = ErrorEnterChatRoom.ALREADY_IN_ROOM.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }

                    // 채팅방 메모리에 유저 정보 추가
                    existsRoom.get().getSessions().put(session, user.get().getUserRoom(roomId));
                    // 유저 메모리에 채팅방 정보 추가
                    sessionUser.get().setCurrentChatRoom(Optional.of(existsRoom.get().getInfo()));

                    switch (existsRoom.get().getOpenType()) {
                        case PRIVATE:
                            sendToEachSession(existsRoom.get().getSessions().keySet(), getAddChatRoomPackets(existsRoom.get()));
                            break;

                        case PUBLIC:
                            sendToAll(getAddChatRoomPackets(existsRoom.get()));
                            break;
                    }

                    var sendCallerBuffer = ByteBuffer.allocate(sendCallerPacketFlag.length + bytesRoomId.length);
                    sendCallerBuffer.put(sendCallerPacketFlag);
                    sendCallerBuffer.put(bytesRoomId);
                    sendToOne(session, sendCallerBuffer.array());

                    var sessionsInRoom = new HashSet<>(existsRoom.get().getSessions().keySet());
                    var sendNoticePacketFlag = new byte[] {PacketType.NOTICE_ENTER_CHAT_ROOM.getByte()};
                    var sendNoticeBuffer = ByteBuffer.allocate(sendNoticePacketFlag.length + 16 + user.get().getName().getBytes().length);
                    sendNoticeBuffer.put(sendNoticePacketFlag);
                    sendNoticeBuffer.put(bytesRoomId);
                    sendNoticeBuffer.put(user.get().getName().getBytes());

                    sendToEachSession(sessionsInRoom, sendNoticeBuffer.array());
                    sendToAll(getPacketUpdatePublicChatRooms());
                    sendEachSessionUpdateChatRoom(existsRoom.get());

                    var chatHistoryCount = existsRoom.get().getChats().size();
                    if (0 < chatHistoryCount) {
                        var sendHistoryPacketFlag = new byte[] {PacketType.HISTORY_CHAT_ROOM.getByte()};
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
                            bytesHistoryChatId = mergeBytePacket(bytesHistoryChatId, Helpers.getByteArrayFromUUID(chat.getChatId()));
                            bytesHistoryUserId = mergeBytePacket(bytesHistoryUserId, Helpers.getByteArrayFromUUID(chat.getUserId()));
                            bytesHistoryChatType = mergeBytePacket(bytesHistoryChatType, new byte[] {chat.getType().getByte()});
                            bytesHistorySendAt = mergeBytePacket(bytesHistorySendAt, Helpers.getByteArrayFromLong(chat.getSendAt().getTime()));
                            bytesHistoryUserNameLength = mergeBytePacket(bytesHistoryUserNameLength, new byte[] {(byte)chat.getUserName().getBytes().length});
                            bytesHistoryMessageLength = mergeBytePacket(bytesHistoryMessageLength, Helpers.getByteArrayFromInt(chat.getMessage().getBytes().length));
                            bytesHistoryUserName = mergeBytePacket(bytesHistoryUserName, chat.getUserName().getBytes());
                            bytesHistoryMessage = mergeBytePacket(bytesHistoryMessage, chat.getMessage().getBytes());
                        }

                        var sendChatHistoryPacket = mergeBytePacket(
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
                        sendToOne(session, sendChatHistoryPacket);
                    }

                    notifyBrowserUserInRoom(existsRoom.get(), "채팅방 입장", "'" + user.get().getName() + "'님이 대화방에 입장했습니다.");
                    lineNotifyService.Notify("채팅방 입장 (roomName:" + existsRoom.get().getRoomName() + ", userId:" + user.get().getId() + ", userName:" + user.get().getName() + ", ip: " + Helpers.getSessionIP(session) + ")");
                } catch (Exception ex) {
                    logger.error(ex.getMessage(), ex);
                }
                break;

            case TALK_CHAT_ROOM:
                try {
                    var sendPacketFlag = new byte[] {type.getByte(), ErrorTalkChatRoom.NONE.getByte()};
                    var chatOptType = ChatType.getType(packet[1]);
                    if (chatOptType.isEmpty()) {
                        sendPacketFlag[1] = ErrorTalkChatRoom.NOT_AVAILABLE_CHAT_TYPE.getByte();
                        sendToOne(session, sendPacketFlag);
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
                        sendToOne(session, sendPacketFlag);
                        return;
                    }

                    var userRoom = existsRoom.get().getSessions().get(session);

                    if (null == userRoom) {
                        sendPacketFlag[1] = ErrorTalkChatRoom.NOT_IN_ROOM.getByte();
                        sendToOne(session, sendPacketFlag);
                        return;
                    }

                    var bytesUserId = Arrays.copyOfRange(packet, 34, 50);
                    var userId = Helpers.getUUIDFromByteArray(bytesUserId);

                    if (sessionUser.isEmpty()) {
                        sendPacketFlag[1] = ErrorTalkChatRoom.NOT_FOUND_USER.getByte();
                        sendToOne(session, sendPacketFlag);
                        return;
                    }

                    var exitsUser = userService.findUser(userId);
                    if (exitsUser.isEmpty()) {
                        sendPacketFlag[1] = ErrorTalkChatRoom.NOT_FOUND_USER.getByte();
                        sendToOne(session, sendPacketFlag);
                        return;
                    }

                    if (!userRoom.getUserId().equals(userId)) {
                        sendPacketFlag[1] = ErrorTalkChatRoom.NOT_FOUND_USER.getByte();
                        sendToOne(session, sendPacketFlag);
                        return;
                    }

                    var userName = sessionUser.get().getName();
                    var bytesUserName = userName.getBytes();
                    var bytesUserNameBytesLength = (byte)bytesUserName.length;
                    var bytesChatMessageBytesLength = Arrays.copyOfRange(packet, 50, 54);
                    var chatMessageBytesLength = Helpers.getIntFromByteArray(bytesChatMessageBytesLength);
                    var bytesChatMessage = Arrays.copyOfRange(packet, 54, 54 + chatMessageBytesLength);
                    var chatMessage = new String(bytesChatMessage);
                    var sendAt = new Date();
                    var bytesNow = Helpers.getByteArrayFromLong(sendAt.getTime());
                    var chat = new Chat(chatId, roomId, userId, userName, chatType, chatMessage, sendAt);
                    if (isDevelopment && ChatType.IMAGE != chatType)
                        logger.info("TALK_CHAT_ROOM: " + chatType + ", " + roomId + ", " + userId + ", " + userName + ", " + chatMessage + ", " + sendAt + ", " + chatId);

                    var sessionsInRoom = new HashSet<>(existsRoom.get().getSessions().keySet());
                    var sendRoomBuffer = ByteBuffer.allocate(sendPacketFlag.length + 1 + bytesRoomId.length + bytesUserId.length + bytesChatId.length + 8 + 1 + 4 + bytesUserName.length + chatMessageBytesLength);
                    sendRoomBuffer.put(sendPacketFlag);
                    sendRoomBuffer.put(chatType.getByte());
                    sendRoomBuffer.put(bytesRoomId);
                    sendRoomBuffer.put(bytesUserId);
                    sendRoomBuffer.put(bytesChatId);
                    sendRoomBuffer.put(bytesNow);
                    sendRoomBuffer.put(bytesUserNameBytesLength);
                    sendRoomBuffer.put(bytesChatMessageBytesLength);
                    sendRoomBuffer.put(bytesUserName);
                    sendRoomBuffer.put(bytesChatMessage);
                    sendToEachSession(sessionsInRoom, sendRoomBuffer.array());
                    notifyBrowserUserInRoom(existsRoom.get(), userName, chatMessage);
                    chatRoomService.addChatToRoom(chat);
                } catch (Exception ex) {
                    logger.error(ex.getMessage(), ex);
                }
                break;

            default:
                break;
        }
    }

    private void noticeUserExitChatRoom (ChatRoom chatRoom, String userName) throws Exception {
        var sessionsInRoom = new HashSet<>(chatRoom.getSessions().keySet());
        var sendNoticePacketFlag = new byte[] {PacketType.NOTICE_EXIT_CHAT_ROOM.getByte()};
        var sendNoticeBuffer = ByteBuffer.allocate(sendNoticePacketFlag.length + 16 + userName.getBytes().length);
        sendNoticeBuffer.put(sendNoticePacketFlag);
        sendNoticeBuffer.put(Helpers.getByteArrayFromUUID(chatRoom.getRoomId()));
        sendNoticeBuffer.put(userName.getBytes());
        sendToEachSession(sessionsInRoom, sendNoticeBuffer.array());
    }

    private void noticeChangeUserNameChatRoom(ChatRoom chatRoom, String oldUserName, String newUserName) throws Exception {
        var sessionsInRoom = new HashSet<>(chatRoom.getSessions().keySet());
        var sendNoticePacketFlag = new byte[] {PacketType.NOTICE_CHANGE_NAME_CHAT_ROOM.getByte()};
        var sendNoticeBuffer = ByteBuffer.allocate(sendNoticePacketFlag.length + 17 + oldUserName.getBytes().length + newUserName.getBytes().length);
        sendNoticeBuffer.put(sendNoticePacketFlag);
        sendNoticeBuffer.put(Helpers.getByteArrayFromUUID(chatRoom.getRoomId()));
        sendNoticeBuffer.put(new byte[] {(byte) oldUserName.getBytes().length});
        sendNoticeBuffer.put(oldUserName.getBytes());
        sendNoticeBuffer.put(newUserName.getBytes());
        sendToEachSession(sessionsInRoom, sendNoticeBuffer.array());
    }

    private void exitAllRooms(WebSocketSession session) throws Exception {
        var user = connectedSessions.get(session);
        if (user.isEmpty())
            return;

        for (ChatRoom chatRoom : chatRoomService.findAllPrivateChatRoomsByUserId(user.get().getId())) {
            try {
                var userRoom = chatRoom.getSessions().get(session);
                if (null == userRoom)
                    continue;

                var exitResult = chatRoomService.exitRoom(chatRoom.getRoomId(), session);
                if (ErrorExitChatRoom.ROOM_REMOVED == exitResult) {
                    switch (chatRoom.getOpenType()) {
                        case PRIVATE:
                            break;

                        case PUBLIC:
                            sendToAll(getRemoveChatRoomPackets(chatRoom.getRoomId()));
                            break;
                    }
                } else if (ErrorExitChatRoom.NONE == exitResult) {
                    noticeUserExitChatRoom(chatRoom, user.get().getName());
                }
            } catch (Exception ex) {
                logger.error(ex.getMessage(), ex);
            }
        }

        for (ChatRoom chatRoom : chatRoomService.findAllPublicChatRooms()) {
            try {
                var userRoom = chatRoom.getSessions().get(session);
                if (null == userRoom)
                    continue;

                var exitResult = chatRoomService.exitRoom(chatRoom.getRoomId(), session);
                if (ErrorExitChatRoom.ROOM_REMOVED == exitResult) {
                    switch (chatRoom.getOpenType()) {
                        case PRIVATE:
                            break;

                        case PUBLIC:
                            sendToAll(getRemoveChatRoomPackets(chatRoom.getRoomId()));
                            break;
                    }
                } else if (ErrorExitChatRoom.NONE == exitResult) {
                    noticeUserExitChatRoom(chatRoom, user.get().getName());
                }
            } catch (Exception ex) {
                logger.error(ex.getMessage(), ex);
            }
        }
    }

    public byte[] mergeBytePacket(byte[]... packets) throws Exception {
        if (1 > packets.length)
            return new byte[0];

        var mergedLength = 0;
        for (byte[] packet : packets)
            mergedLength += packet.length;

        var buffer = ByteBuffer.allocate(mergedLength);
        for (byte[] packet : packets)
            buffer.put(packet);

        return buffer.array();
    }

    public void sendToOne(WebSocketSession session, byte[] packet) throws Exception {
        try {
            consoleLogBytePackets(packet, "sendToOne");

            session.sendMessage(new BinaryMessage(packet));
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void sendToEachSession(Set<WebSocketSession> sessions, byte[] packet) throws Exception {
        consoleLogBytePackets(packet, "sendToEach");

        sessions.parallelStream().forEach(session -> {
            try {
                session.sendMessage(new BinaryMessage(packet));
            } catch (Exception ex) {
                logger.error(ex.getMessage(), ex);
            }
        });
    }

    public void sendToAll(byte[] packet) throws Exception {
        consoleLogBytePackets(packet, "sendToAll");

        connectedSessions.keySet().parallelStream().forEach(session -> {
            try {
                session.sendMessage(new BinaryMessage(packet));
            } catch (Exception ex) {
                logger.error(ex.getMessage(), ex);
            }
        });
    }

    private byte[] getPacketUpdatePublicChatRooms() throws Exception {
        var bytesUpdatePacketFlag = new byte[] {PacketType.UPDATE_PUBLIC_CHAT_ROOMS.getByte()};
        // 최대 채팅방 숫자는 int32
        var bytesRoomCount = Helpers.getByteArrayFromInt(chatRoomService.findAllPublicChatRooms().size());

        var bytesRoomIds = new byte[0];
        var bytesRoomUserCount = new byte[0];
        var bytesRoomNameLengths = new byte[0];
        var bytesRoomNames = new byte[0];

        for (ChatRoom chatRoom : chatRoomService.findAllPublicChatRooms()) {
            bytesRoomIds = mergeBytePacket(bytesRoomIds, Helpers.getByteArrayFromUUID(chatRoom.getRoomId()));
            bytesRoomUserCount = mergeBytePacket(bytesRoomUserCount, Helpers.getByteArrayFromInt(chatRoom.getSessions().size()));
            var bytesRoomName = chatRoom.getRoomName().getBytes();
            bytesRoomNameLengths = mergeBytePacket(bytesRoomNameLengths, new byte[] {(byte)bytesRoomName.length});
            bytesRoomNames = mergeBytePacket(bytesRoomNames, bytesRoomName);
        }

        return mergeBytePacket(bytesUpdatePacketFlag, bytesRoomCount, bytesRoomIds, bytesRoomUserCount, bytesRoomNameLengths, bytesRoomNames);
    }

    private byte[] getAddChatRoomPackets(ChatRoom chatRoom) throws Exception {
        var bytesAddRoomFlag = new byte[] {PacketType.ADD_CHAT_ROOM.getByte()};
        var bytesAddRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
        var bytesAddRoomOpenType = new byte[] {chatRoom.getOpenType().getByte()};
        var bytesAddRoomUserCount = Helpers.getByteArrayFromInt(chatRoom.getSessions().size());
        var bytesAddRoomName = chatRoom.getRoomName().getBytes();
        return mergeBytePacket(bytesAddRoomFlag, bytesAddRoomId, bytesAddRoomOpenType, bytesAddRoomUserCount, bytesAddRoomName);
    }

    private byte[] getRemoveChatRoomPackets(String roomId) throws Exception {
        var bytesRemoveRoomFlag = new byte[] {PacketType.REMOVE_CHAT_ROOM.getByte()};
        var bytesRemoveRoomId = Helpers.getByteArrayFromUUID(roomId);
        return mergeBytePacket(bytesRemoveRoomFlag, bytesRemoveRoomId);
    }

    private void sendEachSessionUpdateChatRoom(String roomId) throws Exception {
        var chatRoom = chatRoomService.findPrivateRoomById(roomId);

        if (chatRoom.isEmpty())
            chatRoom = chatRoomService.findPublicRoomById(roomId);

        if (chatRoom.isEmpty())
            return;

        sendEachSessionUpdateChatRoom(chatRoom.get());
    }

    private void sendEachSessionUpdateChatRoom(ChatRoom chatRoom) throws Exception {
        if (chatRoom.getSessions().isEmpty())
            return;

        var bytesUpdatePacketFlag = new byte[] {PacketType.UPDATE_CHAT_ROOM.getByte()};
        // 입장한 사용자 숫자는 int32
        var bytesUserCount = Helpers.getByteArrayFromInt(chatRoom.getSessions().size());

        var bytesUserIds = new byte[0];
        var bytesUserNameLengths = new byte[0];
        var bytesUserNames = new byte[0];
        var sessions = chatRoom.getSessions().keys();
        while (sessions.hasMoreElements()) {
            var session = sessions.nextElement();
            var optUser = connectedSessions.get(session);
            if (optUser.isEmpty())
                continue;

            var user = optUser.get();
            bytesUserIds = mergeBytePacket(bytesUserIds, Helpers.getByteArrayFromUUID(user.getId()));
            var bytesUserName = user.getName().getBytes();
            bytesUserNameLengths = mergeBytePacket(bytesUserNameLengths, new byte[] {(byte)bytesUserName.length});
            bytesUserNames = mergeBytePacket(bytesUserNames, bytesUserName);
        }

        var packet = mergeBytePacket(bytesUpdatePacketFlag, bytesUserCount, bytesUserIds, bytesUserNameLengths, bytesUserNames);
        sendToEachSession(chatRoom.getSessions().keySet(), packet);
    }

    private void consoleLogBytePackets(byte[] packet, String name) throws Exception {
        if (!isDevelopment)
            return;

        var packetString = new StringBuilder();
        packetString.append(name).append("[").append(packet.length).append("]").append(":");

        for (var i = 0; i < packet.length; i++) {
            var b = packet[i];
            packetString.append(" (").append(i).append(")").append(b);
        }

        logger.info(packetString.toString());
    }

    private void notifyBrowserUserInRoom(ChatRoom chatRoom, String title, String body) {
        chatRoom.getSessions().values().forEach(userInRoom -> {
            userInRoom.getSubscription().ifPresent(subscription -> {
                messageService.sendNotification(subscription, title, body);
            });
        });
    }

    private void consoleLogConnectionState() {
        if (!isDevelopment)
            return;

        try {
            logger.info("sessionCount: " + connectedSessions.size());
            connectedSessions.values().forEach(user -> {
                if (user.isPresent()) {
                    try {
                        logger.info("sessionUser: " + (new ObjectMapper()).writeValueAsString(user.get()));
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                    }
                }
            });
            logger.info("Public RoomCount: " + chatRoomService.findAllPublicChatRooms().size());
            logger.info("Private RoomCount: " + chatRoomService.findAllPrivateChatRooms().size());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }
}
