package com.zangho.game.server.socketHandler.chat;

import com.zangho.game.server.define.*;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.helper.Helpers;
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
    private final boolean isDevelopment;
    private final SessionHandler sessionHandler;
    private final ReqHandler reqHandler;
    private final UserService userService;

    public SocketHandler(
            SessionHandler sessionHandler,
            ReqHandler reqHandler,
            UserService userService
    ) {
        var config = System.getProperty("Config");
        isDevelopment = null == config || !config.equals("production");
        this.sessionHandler = sessionHandler;
        this.reqHandler = reqHandler;
        this.userService = userService;
    }

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) throws Exception {
        reqHandler.onAfterConnectionEstablished(session);
        super.afterConnectionEstablished(session);
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession closeSession, @NonNull CloseStatus status) throws Exception {
        reqHandler.onAfterConnectionClosed(closeSession, status);
        super.afterConnectionClosed(closeSession, status);
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
        try {

            sessionHandler.consoleLogState("message");
            var payload = message.getPayload();
            if (!payload.hasArray())
                return;

            var packet = payload.array();

            if (1 > packet.length)
                return;

            var optType = ReqType.getType(packet[0]);
            if (optType.isEmpty())
                return;

            var type = optType.get();
            Optional<User> connectedUser = switch (type) {
                case REQ_CHECK_CONNECTION -> Optional.empty();
                default -> userService.getConnectedUser(session);
            };

            if (isDevelopment && !type.equals(ReqType.REQ_CHECK_CONNECTION))
                logger.info(type.name() + ": " + Helpers.getSessionIP(session));

            switch (type) {
                case REQ_CHECK_CONNECTION:
                    reqHandler.onCheckConnection(session, packet);
                    break;

                case REQ_CHECK_AUTHENTICATION:
                    reqHandler.onCheckAuthentication(session, connectedUser, packet);
                    break;

                case REQ_SIGN_IN:
                    reqHandler.onSignIn(session, connectedUser, packet);
                    break;

                case REQ_SIGN_OUT:
                    reqHandler.onSignOut(session, connectedUser, packet);
                    break;

                case REQ_CHECK_NOTIFICATION:
                    reqHandler.onCheckNotification(session, connectedUser, packet);
                    break;

                case REQ_REMOVE_NOTIFICATION:
                    reqHandler.onRemoveNotification(session, connectedUser, packet);
                    break;

                case REQ_CONNECTED_USERS:
                    reqHandler.onConnectedUsers(session);
                    break;

                case REQ_GET_TOKEN_USER_INFO:
                    reqHandler.onGetTokenUserInfo(session, connectedUser, packet);
                    break;

                case REQ_GET_OTHERS_USER_INFO:
                    reqHandler.onGetOthersUserInfo(session, connectedUser, packet);
                    break;

                case REQ_FOLLOW:
                    reqHandler.onFollow(session, connectedUser, packet);
                    break;

                case REQ_UNFOLLOW:
                    reqHandler.onUnfollow(session, connectedUser, packet);
                    break;

                case REQ_START_CHAT:
                    reqHandler.onStartChat(session, connectedUser, packet);
                    break;

                case REQ_CHANGE_USER_NAME:
                    reqHandler.onChangeNickName(session, connectedUser, packet);
                    break;

                case REQ_CHANGE_USER_MESSAGE:
                    reqHandler.onChangeUserMessage(session, connectedUser, packet);
                    break;

                case REQ_CHANGE_USER_PROFILE:
                    reqHandler.onChangeUserProfile(session, connectedUser, packet);
                    break;

                case REQ_REMOVE_USER_PROFILE:
                    reqHandler.onRemoveUserProfile(session, connectedUser, packet);
                    break;

                case REQ_CREATE_CHAT_ROOM:
                    reqHandler.onCreateChatRoom(session, connectedUser, packet);
                    break;

                case REQ_ADD_USER_CHAT_ROOM:
                    reqHandler.onAddUserChatRoom(session, connectedUser, packet);
                    break;

                case REQ_REMOVE_CHAT_ROOM:
                    reqHandler.onRemoveChatRoom(session, connectedUser, packet);
                    break;

                case REQ_ENTER_CHAT_ROOM:
                    reqHandler.onEnterChatRoom(session, connectedUser, packet);
                    break;

                case REQ_EXIT_CHAT_ROOM:
                    reqHandler.onExitChatRoom(session, connectedUser, packet);
                    break;

                case REQ_TALK_CHAT_ROOM:
                    reqHandler.onTalkChatRoom(session, connectedUser, packet);
                    break;

                case REQ_HISTORY_CHAT_ROOM:
                    reqHandler.onHistoryChatRoom(session, connectedUser, packet);
                    break;

                default:
                    break;
            }

        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

}