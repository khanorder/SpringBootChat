package com.zangho.game.server.socketHandler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zangho.game.server.define.*;
import com.zangho.game.server.domain.ChatRoom;
import com.zangho.game.server.domain.User;
import com.zangho.game.server.helper.Helpers;
import com.zangho.game.server.service.ChatService;
import com.zangho.game.server.service.LineNotifyService;
import com.zangho.game.server.service.UserService;
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
    private final LineNotifyService lineNotifyService;
    private final Map<WebSocketSession, Optional<User>> connectedSessions;
    private final boolean isDevelopment;

    public GameSocketHandler(UserService userService, ChatService chatService, LineNotifyService lineNotifyService) {
        this.userService = userService;
        this.chatService = chatService;
        this.lineNotifyService = lineNotifyService;
        this.connectedSessions = new ConcurrentHashMap<>();
        var config = System.getProperty("Config");
        isDevelopment = null == config || !config.equals("production");
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        connectedSessions.put(session, Optional.empty());
        sendToOne(session, updateChatRooms());
        logConnectionState();
        if (isDevelopment)
            logger.info("connected");
        lineNotifyService.Notify("채팅샘플 접속 (" + Helpers.getSessionIP(session) + ")");
        super.afterConnectionEstablished(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession closeSession, CloseStatus status) throws Exception {
        connectedSessions.remove(closeSession);
        var chatRooms = new ArrayList<ChatRoom>();
        for (var chatRoom : chatService.findAllRoom()) {
            if (chatRoom.getSessions().containsKey(closeSession))
                chatRooms.add(chatRoom);
        }

        exitAllRooms(closeSession);
        for (ChatRoom chatRoom : chatRooms) {
            updateChatRoom(chatRoom);
        }
        sendToAll(updateChatRooms());
        logConnectionState();
        lineNotifyService.Notify("채팅샘플 접속종료 (" + Helpers.getSessionIP(closeSession) + ")");
        super.afterConnectionClosed(closeSession, status);
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
        logConnectionState();
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
                            logBytePackets(sendCallerPacketFlag, "failed create user");
                            break;
                        }
                    }

                    user.ifPresent(old -> old.setChatRoom(Optional.empty()));
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
                    if (result && sessionUser.get().getChatRoom().isPresent()) {
                        var enteredRoom = chatService.findRoomById(sessionUser.get().getChatRoom().get().getRoomId());
                        if (enteredRoom.isPresent() && !enteredRoom.get().getSessions().isEmpty()) {
                            var userInRoom = enteredRoom.get().getSessions().values().stream().filter(roomUser -> roomUser.getId().equals(userId)).findAny();
                            userInRoom.ifPresent(existsUser -> existsUser.setName(newUserName));
                            noticeChangeUserNameChatRoom(enteredRoom.get(), oldUserName, newUserName);
                            updateChatRoom(enteredRoom.get());
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
                    var bytesUserId = Arrays.copyOfRange(packet, 1, 17);
                    var bytesRoomName = Arrays.copyOfRange(packet, 17, packet.length);
                    var userId = Helpers.getUUIDFromByteArray(bytesUserId);
                    var roomName = new String(bytesRoomName);
                    var existsRoom = chatService.findRoomByName(roomName);
                    if (existsRoom.isPresent()) {
                        sendCallerPacketFlag[1] = ErrorCreateChatRoom.EXISTS_ROOM.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }

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

                    var room = chatService.createRoom(roomName, session, user.get());
                    if (isDevelopment)
                        logger.info("CREATE_CHAT_ROOM: " + room.getRoomId() + ", " + roomName + ", " + user.get().getId() + ", " + user.get().getName());

                    var bytesRoomId = Helpers.getByteArrayFromUUID(room.getRoomId());
                    if (0 == bytesRoomId.length) {
                        sendCallerPacketFlag[1] = ErrorCreateChatRoom.REQUIRED_ROOM_ID.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }

                    var sendCallerBuffer = ByteBuffer.allocate(sendCallerPacketFlag.length + bytesRoomId.length);
                    sendCallerBuffer.put(sendCallerPacketFlag);
                    sendCallerBuffer.put(bytesRoomId);
                    sendToOne(session, sendCallerBuffer.array());
                    sendToAll(updateChatRooms());
                    updateChatRoom(room);
                    sessionUser.get().setChatRoom(Optional.of(room.getInfo()));
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
                    var existsRoom = chatService.findRoomById(roomId);
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

                    var callerUser = existsRoom.get().getSessions().get(session);

                    if (!chatService.exitRoom(roomId, session)) {
                        sendCallerPacketFlag[1] = ErrorExitChatRoom.FAILED_TO_EXIT.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }

                    sessionUser.ifPresent(old -> old.setChatRoom(Optional.empty()));

                    sendToOne(session, sendCallerPacketFlag);
                    noticeUserExitChatRoom(existsRoom.get(), callerUser.getName());
                    sendToAll(updateChatRooms());
                    updateChatRoom(existsRoom.get());

                    lineNotifyService.Notify("채팅방 퇴장 (roomName:" + existsRoom.get().getRoomName() + ", userName:" + callerUser.getName() + ", ip: " + Helpers.getSessionIP(session) + ")");
                } catch (Exception ex) {
                    logger.error(ex.getMessage(), ex);
                }
                break;

            case ENTER_CHAT_ROOM:
                try {
                    var sendCallerPacketFlag = new byte[] {type.getByte(), ErrorEnterChatRoom.NONE.getByte()};
                    var bytesRoomId = Arrays.copyOfRange(packet, 1, 17);
                    var roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                    var existsRoom = chatService.findRoomById(roomId);
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

                    existsRoom.get().getSessions().put(session, user.get());
                    sessionUser.ifPresent(old -> old.setChatRoom(Optional.of(existsRoom.get().getInfo())));

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
                    sendToAll(updateChatRooms());
                    updateChatRoom(existsRoom.get());
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
                    var bytesRoomId = Arrays.copyOfRange(packet, 2, 18);
                    var roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                    var existsRoom = chatService.findRoomById(roomId);
                    if (existsRoom.isEmpty()) {
                        sendPacketFlag[1] = ErrorTalkChatRoom.NO_EXISTS_ROOM.getByte();
                        sendToOne(session, sendPacketFlag);
                        return;
                    }

                    var userInRoom = existsRoom.get().getSessions().get(session);

                    if (null == userInRoom) {
                        sendPacketFlag[1] = ErrorTalkChatRoom.NOT_IN_ROOM.getByte();
                        sendToOne(session, sendPacketFlag);
                        return;
                    }

                    var bytesUserId = Arrays.copyOfRange(packet, 18, 34);
                    var userId = Helpers.getUUIDFromByteArray(bytesUserId);

                    var exitsUser = userService.findUser(userId);
                    if (exitsUser.isEmpty()) {
                        sendPacketFlag[1] = ErrorTalkChatRoom.NOT_FOUND_USER.getByte();
                        sendToOne(session, sendPacketFlag);
                        return;
                    }

                    if (!userInRoom.getId().equals(userId)) {
                        sendPacketFlag[1] = ErrorTalkChatRoom.NOT_FOUND_USER.getByte();
                        sendToOne(session, sendPacketFlag);
                        return;
                    }

                    var userName = userInRoom.getName();
                    var bytesUserName = userName.getBytes();
                    var bytesUserNameBytesLength = (byte)bytesUserName.length;
                    var bytesChatMessageBytesLength = Arrays.copyOfRange(packet, 34, 38);
                    var chatMessageBytesLength = Helpers.getIntFromByteArray(bytesChatMessageBytesLength);
                    var bytesChatMessage = Arrays.copyOfRange(packet, 38, 38 + chatMessageBytesLength);
                    var chatMessage = new String(bytesChatMessage);
                    var now = new Date().getTime();
                    var bytesNow = Helpers.getByteArrayFromLong(now);
                    var chatId = UUID.randomUUID().toString();
                    var bytesChatId = Helpers.getByteArrayFromUUID(chatId);
                    if (isDevelopment)
                        logger.info("TALK_CHAT_ROOM: " + chatType + ", " + roomId + ", " + userId + ", " + userName + ", " + chatMessage + ", " + now + ", " + chatId);

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
        for (ChatRoom chatRoom : chatService.findAllRoom()) {
            try {
                var user = chatRoom.getSessions().get(session);
                if (null == user)
                    continue;

                var isExit = chatService.exitRoom(chatRoom.getRoomId(), session);
                if (chatRoom.getSessions().isEmpty()) {
                    chatService.removeRoom(chatRoom.getRoomId());
                } else if (isExit) {
                    noticeUserExitChatRoom(chatRoom, user.getName());
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
            logBytePackets(packet, "sendToOne");

            session.sendMessage(new BinaryMessage(packet));
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void sendToEachSession(Set<WebSocketSession> sessions, byte[] packet) throws Exception {
        logBytePackets(packet, "sendToEach");

        sessions.parallelStream().forEach(session -> {
            try {
                session.sendMessage(new BinaryMessage(packet));
            } catch (Exception ex) {
                logger.error(ex.getMessage(), ex);
            }
        });
    }

    public void sendToAll(byte[] packet) throws Exception {
        logBytePackets(packet, "sendToAll");

        connectedSessions.keySet().parallelStream().forEach(session -> {
            try {
                session.sendMessage(new BinaryMessage(packet));
            } catch (Exception ex) {
                logger.error(ex.getMessage(), ex);
            }
        });
    }

    private byte[] updateChatRooms() throws Exception {
        var bytesUpdatePacketFlag = new byte[] {PacketType.UPDATE_CHAT_ROOMS.getByte()};
        // 최대 채팅방 숫자는 int32
        var bytesRoomCount = Helpers.getByteArrayFromInt(chatService.findAllRoom().size());

        var bytesRoomIds = new byte[0];
        var bytesRoomUserCount = new byte[0];
        var bytesRoomNameLengths = new byte[0];
        var bytesRoomNames = new byte[0];

        for (ChatRoom chatRoom : chatService.findAllRoom()) {
            bytesRoomIds = mergeBytePacket(bytesRoomIds, Helpers.getByteArrayFromUUID(chatRoom.getRoomId()));
            bytesRoomUserCount = mergeBytePacket(bytesRoomUserCount, Helpers.getByteArrayFromInt(chatRoom.getSessions().size()));
            var bytesRoomName = chatRoom.getRoomName().getBytes();
            bytesRoomNameLengths = mergeBytePacket(bytesRoomNameLengths, new byte[] {(byte)bytesRoomName.length});
            bytesRoomNames = mergeBytePacket(bytesRoomNames, bytesRoomName);
        }

        return mergeBytePacket(bytesUpdatePacketFlag, bytesRoomCount, bytesRoomIds, bytesRoomUserCount, bytesRoomNameLengths, bytesRoomNames);
    }

    private void updateChatRoom(String roomId) throws Exception {
        var chatRoom = chatService.findRoomById(roomId);
        if (chatRoom.isEmpty())
            return;

        updateChatRoom(chatRoom.get());
    }

    private void updateChatRoom(ChatRoom chatRoom) throws Exception {
        if (chatRoom.getSessions().isEmpty())
            return;

        var bytesUpdatePacketFlag = new byte[] {PacketType.UPDATE_CHAT_ROOM.getByte()};
        // 입장한 사용자 숫자는 int32
        var bytesUserCount = Helpers.getByteArrayFromInt(chatRoom.getSessions().size());

        var bytesUserIds = new byte[0];
        var bytesUserNameLengths = new byte[0];
        var bytesUserNames = new byte[0];
        for (User user : chatRoom.getSessions().values()) {
            bytesUserIds = mergeBytePacket(bytesUserIds, Helpers.getByteArrayFromUUID(user.getId()));
            var bytesUserName = user.getName().getBytes();
            bytesUserNameLengths = mergeBytePacket(bytesUserNameLengths, new byte[] {(byte)bytesUserName.length});
            bytesUserNames = mergeBytePacket(bytesUserNames, bytesUserName);
        }

        var packet = mergeBytePacket(bytesUpdatePacketFlag, bytesUserCount, bytesUserIds, bytesUserNameLengths, bytesUserNames);
        sendToEachSession(chatRoom.getSessions().keySet(), packet);
    }

    private void logBytePackets(byte[] packet, String name) throws Exception {
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

    private void logConnectionState() {
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
            logger.info("roomCount: " + chatService.findAllRoom().size());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }
}
