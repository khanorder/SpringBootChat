package com.zangho.game.server.socketHandler.chat;

import com.zangho.game.server.define.*;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.service.*;
import lombok.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.*;

public class SocketHandler extends TextWebSocketHandler {

    private final Logger logger = LoggerFactory.getLogger(SocketHandler.class);
    private final SessionHandler sessionHandler;
    private final ReceiveHandler receiveHandler;
    private final UserService userService;

    public SocketHandler(
            SessionHandler sessionHandler,
            ReceiveHandler receiveHandler,
            UserService userService
    ) {
        this.sessionHandler = sessionHandler;
        this.receiveHandler = receiveHandler;
        this.userService = userService;
    }

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) throws Exception {
        receiveHandler.onAfterConnectionEstablished(session);
        super.afterConnectionEstablished(session);
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession closeSession, @NonNull CloseStatus status) throws Exception {
        receiveHandler.onAfterConnectionClosed(closeSession, status);
        super.afterConnectionClosed(closeSession, status);
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
        sessionHandler.consoleLogState("message");
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
        Optional<User> connectedUser = switch (type) {
            case CHECK_CONNECTION -> Optional.empty();
            default -> userService.getConnectedUser(session);
        };

        switch (type) {
            case CHECK_CONNECTION:
                receiveHandler.onCheckConnection(type, session, packet);
                break;

            case CHECK_AUTHENTICATION:
                receiveHandler.onCheckAuthentication(type, session, connectedUser, packet);
                break;

            case CHANGE_USER_NAME:
                receiveHandler.onChangeUserName(type, session, connectedUser, packet);
                break;

            case CREATE_CHAT_ROOM:
                receiveHandler.onCreateChatRoom(type, session, connectedUser, packet);
                break;

            case EXIT_CHAT_ROOM:
                receiveHandler.onExitChatRoom(type, session, connectedUser, packet);
                break;

            case ENTER_CHAT_ROOM:
                receiveHandler.onEnterChatRoom(type, session, connectedUser, packet);
                break;

            case TALK_CHAT_ROOM:
                receiveHandler.onTalkChatRoom(type, session, connectedUser, packet);
                break;

            default:
                break;
        }
    }

}