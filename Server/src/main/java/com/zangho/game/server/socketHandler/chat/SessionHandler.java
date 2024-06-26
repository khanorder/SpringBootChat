package com.zangho.game.server.socketHandler.chat;

import com.zangho.game.server.domain.chat.ChatRoom;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class SessionHandler {

    private final Logger logger = LoggerFactory.getLogger(SessionHandler.class);
    private final boolean isDevelopment;
    private final UserService userService;
    private final ConcurrentHashMap<String, WebSocketSession> connectedSessions;

    public SessionHandler(UserService userService) {
        var config = System.getProperty("Config");
        isDevelopment = null == config || !config.equals("production");
        this.userService = userService;
        this.connectedSessions = new ConcurrentHashMap<>();
    }

    @Async
    public void addSession(WebSocketSession session) {
        connectedSessions.put(session.getId(), session);
    }

    @Async
    public void removeSession(WebSocketSession session) {
        connectedSessions.remove(session.getId());
    }

    public Optional<WebSocketSession> getSession(String sessionId) {
        return Optional.ofNullable(connectedSessions.get(sessionId));
    }

    @Async
    public void sendOneSession(WebSocketSession session, byte[] packet) {
        try {
            if (null == session) {
                logger.info("session is null.");
                return;
            }

            if (!session.isOpen()) {
                logger.info("closed session: " + session.getId());
                return;
            }

            consoleLogPackets(packet, "sendToOne");

            synchronized (session) {
                session.sendMessage(new BinaryMessage(packet));
            }
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void sendEachSession(Set<String> sessionIds, byte[] packet) {
        if (sessionIds.isEmpty())
            return;

        connectedSessions.values().forEach(session -> {
            if (null == session) {
                logger.info("session is null.");
                return;
            }

            if (!session.isOpen()) {
                logger.info("closed session: " + session.getId());
                return;
            }

            if (!sessionIds.contains(session.getId()))
                return;

            try {
                synchronized (session) {
                    session.sendMessage(new BinaryMessage(packet));
                }
            } catch (Exception ex) {
                logger.error(ex.getMessage(), ex);
            }
        });
    }

    @Async
    public void sendEachSessionInRoom(ChatRoom chatRoom, byte[] packet) {
        if (chatRoom.getUsers().isEmpty())
            return;

        var sessionIds = new HashSet<String>();
        chatRoom.getUsers().forEach((key, value) -> {
            var optUser = userService.getConnectedUserByUserId(value.getUserId());
            if (optUser.isEmpty())
                return;

            sessionIds.add(optUser.get().getSessionId());
        });
        sendEachSession(sessionIds, packet);
    }

    @Async
    public void sendAll(byte[] packet) throws Exception {
        consoleLogPackets(packet, "sendToAll");

        connectedSessions.values().forEach(session -> {
            try {
                if (null == session) {
                    logger.info("session is null.");
                    return;
                }

                if (!session.isOpen()) {
                    logger.info("closed session: " + session.getId());
                    return;
                }

                synchronized (session) {
                    session.sendMessage(new BinaryMessage(packet));
                }
            } catch (Exception ex) {
                logger.error(ex.getMessage(), ex);
            }
        });
    }

    @Async
    public void sendOthers(WebSocketSession mineSession, byte[] packet) throws Exception {
        consoleLogPackets(packet, "sendToOthers");

        connectedSessions.values().forEach(session -> {
            try {
                if (null == session) {
                    logger.info("session is null.");
                    return;
                }

                if (!session.isOpen()) {
                    logger.info("closed session: " + session.getId());
                    return;
                }

                if (session.getId().equals(mineSession.getId()))
                    return;

                synchronized (session) {
                    session.sendMessage(new BinaryMessage(packet));
                }
            } catch (Exception ex) {
                logger.error(ex.getMessage(), ex);
            }
        });
    }

    @Async
    public void consoleLogPackets(byte[] packet, String name) throws Exception {
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

    @Async
    public void consoleLogState(String position) {
        if (!isDevelopment)
            return;

        try {
            var logPosition = (position.isEmpty() ? "" : position + " - ");
            logger.info(logPosition + "sessionCount: " + connectedSessions.size());
            logger.info(logPosition + "signedUserCount: " + userService.getConnectedUsers().size());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

}
