package com.zangho.chat.server.socketHandler;

import com.zangho.chat.server.define.*;
import com.zangho.chat.server.domain.ChatRoom;
import com.zangho.chat.server.helper.Helpers;
import com.zangho.chat.server.service.ChatService;
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
    private final Map<WebSocketSession, Set<String>> connectedSessions;

    public ChatSocketHandler(ChatService chatService) {
        this.chatService = chatService;
        this.connectedSessions = new ConcurrentHashMap<>();
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        connectedSessions.put(session, new HashSet<>());
        sendToOne(session, updateChatRoom());
        logConnectionState();
        super.afterConnectionEstablished(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession closeSession, CloseStatus status) throws Exception {
        connectedSessions.remove(closeSession);
        exitAllRooms(closeSession);
        sendToAll(updateChatRoom());
        logConnectionState();
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

                    var room = chatService.createRoom(roomName);
                    room.getSessions().put(session, userName);
                    logger.info("create ChatRoom: " + room.getRoomId() + ", " + roomName + ", " + userName);

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
                    sendToAll(updateChatRoom());
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

                    var callerUserName = existsRoom.get().getSessions().get(session);

                    if (!chatService.exitRoom(roomId, session)) {
                        sendCallerPacketFlag[1] = ErrorExitChatRoom.FAILED_TO_EXIT.getByte();
                        sendToOne(session, sendCallerPacketFlag);
                        return;
                    }

                    sendToOne(session, sendCallerPacketFlag);
                    noticeUserExitChatRoom(existsRoom.get(), callerUserName);
                    sendToAll(updateChatRoom());
                } catch (Exception ex) {
                    logger.error(ex.getMessage(), ex);
                }
                break;

            case ENTER_CHAT_ROOM:
                try {
                    var sendCallerPacketFlag = new byte[] {type.getByte(), ErrorEnterChatRoom.NONE.getByte()};
                    var roomIdBytes = Arrays.copyOfRange(packet, 1, 17);
                    var roomId = Helpers.getUUIDFromByteArray(roomIdBytes);
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

                    var userNameBytes = Arrays.copyOfRange(packet, 17, packet.length);
                    var userName = new String(userNameBytes);
                    existsRoom.get().getSessions().put(session, userName);

                    var sendCallerBuffer = ByteBuffer.allocate(sendCallerPacketFlag.length + roomIdBytes.length);
                    sendCallerBuffer.put(sendCallerPacketFlag);
                    sendCallerBuffer.put(roomIdBytes);
                    sendToOne(session, sendCallerBuffer.array());

                    var sessionsInRoom = new HashSet<>(existsRoom.get().getSessions().keySet());
                    var sendNoticePacketFlag = new byte[] {PacketType.NOTICE_ENTER_CHAT_ROOM.getByte()};
                    var sendNoticeBuffer = ByteBuffer.allocate(sendNoticePacketFlag.length + userName.getBytes().length);
                    sendNoticeBuffer.put(sendNoticePacketFlag);
                    sendNoticeBuffer.put(userName.getBytes());

                    sendToEachSession(sessionsInRoom, sendNoticeBuffer.array());
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

                    if (!existsRoom.get().getSessions().containsKey(session)) {
                        sendPacketFlag[1] = ErrorTalkChatRoom.NOT_IN_ROOM.getByte();
                        sendToOne(session, sendPacketFlag);
                        return;
                    }

                    var userNameBytesLength = packet[17];
                    var chatMessageBytesLength = Helpers.getIntFromByteArray(Arrays.copyOfRange(packet, 18, 22));
                    var bytesUserName = Arrays.copyOfRange(packet, 22, 22 + userNameBytesLength);
                    var bytesChatMessage = Arrays.copyOfRange(packet, 22 + userNameBytesLength, 22 + userNameBytesLength + chatMessageBytesLength);
                    var userName = new String(bytesUserName);
                    var chatMessage = new String(bytesChatMessage);

                    var chatId = UUID.randomUUID().toString();
                    var bytesChatId = Helpers.getByteArrayFromUUID(chatId);

                    var sessionsInRoom = new HashSet<>(existsRoom.get().getSessions().keySet());
                    var sendRoomBuffer = ByteBuffer.allocate(sendPacketFlag.length + 17 + userName.getBytes().length);
                    sendRoomBuffer.put(sendPacketFlag);
                    sendRoomBuffer.put(bytesRoomId);
                    sendRoomBuffer.put(ChatType.TALK.getByte());
                    sendRoomBuffer.put(userName.getBytes());

//                    sendToEachSession(sessionsInRoom, sendRoomBuffer.array());
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
                var userName = chatRoom.getSessions().get(session);
                if (null == userName)
                    continue;

                var isExit = chatService.exitRoom(chatRoom.getRoomId(), session);
                if (chatRoom.getSessions().isEmpty()) {
                    chatService.removeRoom(chatRoom.getRoomId());
                } else if (isExit) {
                    noticeUserExitChatRoom(chatRoom, userName);
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

    private byte[] updateChatRoom() throws Exception {
        var updatePacketFlagBytes = new byte[] {PacketType.UPDATE_CHAT_ROOM.getByte()};
        // 최대 채팅방 숫자는 int32
        var roomCountBytes = Helpers.getByteArrayFromInt(chatService.findAllRoom().size());

        var roomIdsBytes = new byte[0];
        var roomNameLengthsBytes = new byte[0];
        var roomNamesBytes = new byte[0];

        for (ChatRoom chatRoom : chatService.findAllRoom()) {
            roomIdsBytes = mergeBytePacket(roomIdsBytes, Helpers.getByteArrayFromUUID(chatRoom.getRoomId()));
            var roomNameBytes = chatRoom.getRoomName().getBytes();
            roomNameLengthsBytes = mergeBytePacket(roomNameLengthsBytes, new byte[] {(byte)roomNameBytes.length});
            roomNamesBytes = mergeBytePacket(roomNamesBytes, roomNameBytes);
        }

        return mergeBytePacket(updatePacketFlagBytes, roomCountBytes, roomIdsBytes, roomNameLengthsBytes, roomNamesBytes);
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
