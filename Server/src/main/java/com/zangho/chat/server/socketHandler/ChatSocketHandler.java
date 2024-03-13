package com.zangho.chat.server.socketHandler;

import com.zangho.chat.server.define.ErrorCreateChatRoom;
import com.zangho.chat.server.define.ErrorExitChatRoom;
import com.zangho.chat.server.define.PacketType;
import com.zangho.chat.server.domain.ChatRoom;
import com.zangho.chat.server.helper.Helpers;
import com.zangho.chat.server.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
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
        super.afterConnectionEstablished(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession closeSession, CloseStatus status) throws Exception {
        chatService.exitAllRooms(closeSession);
        connectedSessions.remove(closeSession);
        logger.info(chatService.findAllRoom().toString());

        super.afterConnectionClosed(closeSession, status);
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
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
                    var sendPacketFlag = new byte[] {type.getByte(), ErrorCreateChatRoom.NONE.getByte()};
                    var roomNameBytes = Arrays.copyOfRange(packet, 1, packet.length);
                    var roomName = new String(roomNameBytes);
                    var existsRoom = chatService.findRoomByName(roomName);
                    if (existsRoom.isPresent()) {
                        sendPacketFlag[1] = ErrorCreateChatRoom.EXISTS_ROOM.getByte();
                        sendToOne(session, sendPacketFlag);
                        return;
                    }

                    var room = chatService.createRoom(roomName);
                    room.getSessions().add(session);

                    var bytesRoomId = Helpers.ByteArrayFromUUID(room.getRoomId());
                    if (0 == bytesRoomId.length) {
                        sendPacketFlag[1] = ErrorCreateChatRoom.REQUIRED_ROOM_ID.getByte();
                        sendToOne(session, sendPacketFlag);
                        return;
                    }

                    var buffer = ByteBuffer.allocate(sendPacketFlag.length + bytesRoomId.length);
                    buffer.put(sendPacketFlag);
                    buffer.put(bytesRoomId);
                    sendToOne(session, buffer.array());
                } catch (Exception ex) {
                    logger.error(ex.getMessage());
                }
                break;

            case EXIT_CHAT_ROOM:
                try {
                    var sendPacketFlag = new byte[] {type.getByte(), ErrorExitChatRoom.NONE.getByte()};
                    var roomIdBytes = Arrays.copyOfRange(packet, 1, packet.length);
                    var roomId = Helpers.UUIDFromByteArray(roomIdBytes);
                    var existsRoom = chatService.findRoomById(roomId);
                    if (existsRoom.isEmpty()) {
                        sendPacketFlag[1] = ErrorExitChatRoom.NO_EXISTS_ROOM.getByte();
                        sendToOne(session, sendPacketFlag);
                        return;
                    }

                    if (!existsRoom.get().getSessions().contains(session)) {
                        sendPacketFlag[1] = ErrorExitChatRoom.NOT_IN_ROOM.getByte();
                        sendToOne(session, sendPacketFlag);
                        return;
                    }

                    if (!chatService.exitRoom(roomId, session)) {
                        sendPacketFlag[1] = ErrorExitChatRoom.FAILED_TO_EXIT.getByte();
                        sendToOne(session, sendPacketFlag);
                        return;
                    }

                    sendToOne(session, sendPacketFlag);
                } catch (Exception ex) {
                    logger.error(ex.getMessage());
                }
                break;

            default:
                break;
        }
    }

    private byte[] mergeBytePacket(byte[]... packets) {
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

    private void sendToOne(WebSocketSession session, byte[]... packets) {
        try {
            var mergedPacket = mergeBytePacket(packets);

            var packetString = new StringBuilder();
            packetString.append("sendToOne:");
            for (byte b : mergedPacket)
                packetString.append(" ").append((int) b);
            logger.info(packetString.toString());

            session.sendMessage(new BinaryMessage(mergedPacket));
        } catch (Exception ex) {
            logger.error(ex.getMessage());
        }
    }

    private void sendToEachSession(Set<WebSocketSession> sessions, byte[]... packets) {
        var mergedPacket = mergeBytePacket(packets);

        var packetString = new StringBuilder();
        packetString.append("sendToEach:");
        for (byte b : mergedPacket)
            packetString.append(" ").append((int) b);
        logger.info(packetString.toString());

        sessions.parallelStream().forEach(session -> {
            try {
                session.sendMessage(new BinaryMessage(mergedPacket));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
    }

    private void sendToAll(byte[]... packets) {
        var mergedPacket = mergeBytePacket(packets);

        var packetString = new StringBuilder();
        packetString.append("sendToAll:");
        for (byte b : mergedPacket)
            packetString.append(" ").append((int) b);
        logger.info(packetString.toString());

        connectedSessions.keySet().parallelStream().forEach(session -> {
            try {
                session.sendMessage(new BinaryMessage(mergedPacket));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
    }

    private void updateChatRoom() {
        var updatePacketFlag = new byte[] {PacketType.UPDATE_CHAT_ROOM.getByte()};
        var roomCount = chatService.findAllRoom().size();

        // 최대 채팅방 숫자는 int32
        var roomCountBuffer = ByteBuffer.allocate(4).putInt(chatService.findAllRoom().size(), roomCount);

        var roomIdBuffer = ByteBuffer.allocate(roomCount * 16);
        for (ChatRoom chatRoom : chatService.findAllRoom())
            roomIdBuffer.put(Helpers.ByteArrayFromUUID(chatRoom.getRoomId()));

        sendToAll(mergeBytePacket(updatePacketFlag, roomCountBuffer.array(), roomIdBuffer.array()));
    }
}
