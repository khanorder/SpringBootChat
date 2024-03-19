package com.zangho.chat.server.socketHandler;

import com.zangho.chat.server.define.*;
import com.zangho.chat.server.domain.ChatRoom;
import com.zangho.chat.server.domain.User;
import com.zangho.chat.server.helper.Helpers;
import com.zangho.chat.server.service.ChatService;
import com.zangho.chat.server.service.LineNotifyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.nio.ByteBuffer;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class ChatSocketHandler extends TextWebSocketHandler {

    private final Logger logger = LoggerFactory.getLogger(ChatSocketHandler.class);
    private final ChatService chatService;
    private final LineNotifyService lineNotifyService;
    private final Map<WebSocketSession, Set<String>> connectedSessions;

    public ChatSocketHandler(ChatService chatService, LineNotifyService lineNotifyService) {
        this.chatService = chatService;
        this.lineNotifyService = lineNotifyService;
        this.connectedSessions = new ConcurrentHashMap<>();
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        connectedSessions.put(session, new HashSet<>());
        sendToOne(session, updateChatRooms());
        logConnectionState();
        lineNotifyService.Notify("채팅샘플 접속 (" + session.getHandshakeHeaders().get("X-Forwarded-For") + ")");
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
        lineNotifyService.Notify("채팅샘플 접속종료 (" + closeSession.getHandshakeHeaders().get("X-Forwarded-For") + ")");
        super.afterConnectionClosed(closeSession, status);
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
        logConnectionState();
        var payload = message.getPayload();
        if (!payload.hasArray())
            return;

        var packet = payload.array();

        if (1 > packet.length)
            return;

        var type = PacketType.values()[packet[0]];

        switch (type) {
            case CREATE_CHAT_ROOM:
                try {
                    var sendCallerPacketFlag = new byte[] {type.getByte(), ErrorCreateChatRoom.NONE.getByte()};
                    var roomNameLengthBytes = Arrays.copyOfRange(packet, 1, 5);
                    var userNameLengthBytes = Arrays.copyOfRange(packet, 5, 9);
                    var roomNameLength = Helpers.getIntFromByteArray(roomNameLengthBytes);
                    var userNameLength = Helpers.getIntFromByteArray(userNameLengthBytes);
                    var roomNameBytes = Arrays.copyOfRange(packet, 9, 9 + roomNameLength);
                    var roomName = new String(roomNameBytes);
                    var userNameBytes = Arrays.copyOfRange(packet,  9 + roomNameLength, 9 + roomNameLength + userNameLength);
                    var userName = new String(userNameBytes);
                    var existsRoom = chatService.findRoomByName(roomName);
                    if (existsRoom.isPresent()) {
                        sendCallerPacketFlag[1] = ErrorCreateChatRoom.EXISTS_ROOM.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }

                    var userId = UUID.randomUUID().toString();
                    var bytesUserId = Helpers.getByteArrayFromUUID(userId);
                    var user = new User(userId, userName);
                    var room = chatService.createRoom(roomName, session, user);
                    logger.info("create ChatRoom: " + room.getRoomId() + ", " + roomName + ", " + userId + ", " + userName);

                    var bytesRoomId = Helpers.getByteArrayFromUUID(room.getRoomId());
                    if (0 == bytesRoomId.length) {
                        sendCallerPacketFlag[1] = ErrorCreateChatRoom.REQUIRED_ROOM_ID.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }

                    var sendCallerBuffer = ByteBuffer.allocate(sendCallerPacketFlag.length + bytesRoomId.length + bytesUserId.length);
                    sendCallerBuffer.put(sendCallerPacketFlag);
                    sendCallerBuffer.put(bytesRoomId);
                    sendCallerBuffer.put(bytesUserId);
                    sendToOne(session, sendCallerBuffer.array());
                    sendToAll(updateChatRooms());
                    updateChatRoom(room);
                    lineNotifyService.Notify("채팅방 개설 (roomName:" + roomName + ", userName:" + userName + ", ip: " + session.getHandshakeHeaders().get("X-Forwarded-For") + ")");
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

                    sendToOne(session, sendCallerPacketFlag);
                    noticeUserExitChatRoom(existsRoom.get(), callerUser.getName());
                    sendToAll(updateChatRooms());
                    updateChatRoom(existsRoom.get());
                    lineNotifyService.Notify("채팅방 퇴장 (roomName:" + existsRoom.get().getRoomName() + ", userName:" + callerUser.getName() + ", ip: " + session.getHandshakeHeaders().get("X-Forwarded-For") + ")");
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

                    var bytesUserName = Arrays.copyOfRange(packet, 17, packet.length);
                    var userName = new String(bytesUserName);
                    var userId = UUID.randomUUID().toString();
                    var bytesUserId = Helpers.getByteArrayFromUUID(userId);
                    var user = new User(userId, userName);
                    existsRoom.get().getSessions().put(session, user);

                    var sendCallerBuffer = ByteBuffer.allocate(sendCallerPacketFlag.length + bytesRoomId.length + bytesUserId.length);
                    sendCallerBuffer.put(sendCallerPacketFlag);
                    sendCallerBuffer.put(bytesRoomId);
                    sendCallerBuffer.put(bytesUserId);
                    sendToOne(session, sendCallerBuffer.array());

                    var sessionsInRoom = new HashSet<>(existsRoom.get().getSessions().keySet());
                    var sendNoticePacketFlag = new byte[] {PacketType.NOTICE_ENTER_CHAT_ROOM.getByte()};
                    var sendNoticeBuffer = ByteBuffer.allocate(sendNoticePacketFlag.length + userName.getBytes().length);
                    sendNoticeBuffer.put(sendNoticePacketFlag);
                    sendNoticeBuffer.put(userName.getBytes());

                    sendToEachSession(sessionsInRoom, sendNoticeBuffer.array());
                    updateChatRoom(existsRoom.get());
                    lineNotifyService.Notify("채팅방 입장 (roomName:" + existsRoom.get().getRoomName() + ", userName:" + userName + ", ip: " + session.getHandshakeHeaders().get("X-Forwarded-For") + ")");
                } catch (Exception ex) {
                    logger.error(ex.getMessage(), ex);
                }
                break;

            case TALK_CHAT_ROOM:
                try {
                    var sendPacketFlag = new byte[] {type.getByte(), ErrorTalkChatRoom.NONE.getByte()};
                    var bytesRoomId = Arrays.copyOfRange(packet, 1, 17);
                    var roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
                    var existsRoom = chatService.findRoomById(roomId);
                    if (existsRoom.isEmpty()) {
                        sendPacketFlag[1] = ErrorTalkChatRoom.NO_EXISTS_ROOM.getByte();
                        sendToOne(session, sendPacketFlag);
                        return;
                    }

                    var user = existsRoom.get().getSessions().get(session);

                    if (null == user) {
                        sendPacketFlag[1] = ErrorTalkChatRoom.NOT_IN_ROOM.getByte();
                        sendToOne(session, sendPacketFlag);
                        return;
                    }

                    var bytesUserId = Arrays.copyOfRange(packet, 17, 33);
                    var userId = Helpers.getUUIDFromByteArray(bytesUserId);

                    if (!user.getId().equals(userId)) {
                        sendPacketFlag[1] = ErrorTalkChatRoom.NOT_FOUND_USER.getByte();
                        sendToOne(session, sendPacketFlag);
                        return;
                    }

                    var userName = user.getName();
                    var bytesUserName = userName.getBytes();
                    var bytesUserNameBytesLength = (byte)bytesUserName.length;
                    var bytesChatMessageBytesLength = Arrays.copyOfRange(packet, 33, 37);
                    var chatMessageBytesLength = Helpers.getIntFromByteArray(bytesChatMessageBytesLength);
                    var bytesChatMessage = Arrays.copyOfRange(packet, 37, 37 + chatMessageBytesLength);
                    var chatMessage = new String(bytesChatMessage);
                    var now = new Date().getTime();
                    var bytesNow = Helpers.getByteArrayFromLong(now);
                    var chatId = UUID.randomUUID().toString();
                    var bytesChatId = Helpers.getByteArrayFromUUID(chatId);
                    logger.info("talk chat room: " + roomId + ", " + userId + ", " + userName + ", " + chatMessage + ", " + now + ", " + chatId);

                    var sessionsInRoom = new HashSet<>(existsRoom.get().getSessions().keySet());
                    var sendRoomBuffer = ByteBuffer.allocate(sendPacketFlag.length + 1 + bytesRoomId.length + bytesUserId.length + bytesChatId.length + 8 + 1 + 4 + bytesUserName.length + chatMessageBytesLength);
                    sendRoomBuffer.put(sendPacketFlag);
                    sendRoomBuffer.put(ChatType.TALK.getByte());
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
        var sendNoticeBuffer = ByteBuffer.allocate(sendNoticePacketFlag.length + userName.getBytes().length);
        sendNoticeBuffer.put(sendNoticePacketFlag);
        sendNoticeBuffer.put(userName.getBytes());
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

    private byte[] mergeBytePacket(byte[]... packets) throws Exception {
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

    private void sendToOne(WebSocketSession session, byte[] packet) throws Exception {
        try {
            logBytePackets(packet, "sendToOne");

            session.sendMessage(new BinaryMessage(packet));
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    private void sendToEachSession(Set<WebSocketSession> sessions, byte[] packet) throws Exception {
        logBytePackets(packet, "sendToEach");

        sessions.parallelStream().forEach(session -> {
            try {
                session.sendMessage(new BinaryMessage(packet));
            } catch (Exception ex) {
                logger.error(ex.getMessage(), ex);
            }
        });
    }

    private void sendToAll(byte[] packet) throws Exception {
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
        var bytesRoomNameLengths = new byte[0];
        var bytesRoomNames = new byte[0];

        for (ChatRoom chatRoom : chatService.findAllRoom()) {
            bytesRoomIds = mergeBytePacket(bytesRoomIds, Helpers.getByteArrayFromUUID(chatRoom.getRoomId()));
            var bytesRoomName = chatRoom.getRoomName().getBytes();
            bytesRoomNameLengths = mergeBytePacket(bytesRoomNameLengths, new byte[] {(byte)bytesRoomName.length});
            bytesRoomNames = mergeBytePacket(bytesRoomNames, bytesRoomName);
        }

        return mergeBytePacket(bytesUpdatePacketFlag, bytesRoomCount, bytesRoomIds, bytesRoomNameLengths, bytesRoomNames);
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
        var packetString = new StringBuilder();
        packetString.append(name).append("[").append(packet.length).append("]").append(":");

        for (var i = 0; i < packet.length; i++) {
            var b = packet[i];
            packetString.append(" (").append(i).append(")").append(b);
        }

        logger.info(packetString.toString());
    }

    private void logConnectionState() {
        try {
            logger.info("sessionCount: " + connectedSessions.size());
            logger.info("roomCount: " + chatService.findAllRoom().size());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }
}
