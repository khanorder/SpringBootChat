package com.zangho.game.server.socketHandler.chat;

import com.zangho.game.server.define.NotificationType;
import com.zangho.game.server.define.ResType;
import com.zangho.game.server.define.RoomOpenType;
import com.zangho.game.server.domain.chat.Chat;
import com.zangho.game.server.domain.chat.ChatRoom;
import com.zangho.game.server.domain.chat.ChatRoomInfoInterface;
import com.zangho.game.server.domain.user.Notification;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.domain.user.UserInterface;
import com.zangho.game.server.error.*;
import com.zangho.game.server.helper.Helpers;
import com.zangho.game.server.service.JwtService;
import com.zangho.game.server.service.MessageService;
import com.zangho.game.server.service.NotificationService;
import com.zangho.game.server.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.socket.WebSocketSession;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentLinkedQueue;

public class ResHandler {

    private final Logger logger = LoggerFactory.getLogger(ResHandler.class);
    private final boolean isDevelopment;
    private final SessionHandler sessionHandler;
    private final UserService userService;
    private final NotificationService notificationService;
    private final MessageService messageService;
    private final JwtService jwtService;

    @Value("${server.version.main}")
    private int serverVersionMain;
    @Value("${server.version.update}")
    private int serverVersionUpdate;
    @Value("${server.version.maintenance}")
    private int serverVersionMaintenance;

    public ResHandler(SessionHandler sessionHandler, UserService userService, NotificationService notificationService, JwtService jwtService, MessageService messageService) {
        var config = System.getProperty("Config");
        isDevelopment = null == config || !config.equals("production");
        this.sessionHandler = sessionHandler;
        this.userService = userService;
        this.notificationService = notificationService;
        this.jwtService = jwtService;
        this.messageService = messageService;
    }

    public Optional<WebSocketSession> getSessionByUserId(String userId) {
        var connectedOtherUser = userService.getConnectedUserByUserId(userId);
        if (connectedOtherUser.isEmpty() || connectedOtherUser.get().getSessionId().isEmpty())
            return Optional.empty();

        return sessionHandler.getSession(connectedOtherUser.get().getSessionId());
    }

    @Async
    public void resCheckConnection(WebSocketSession session, ErrorCheckConnection error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_CHECK_CONNECTION, error);
            var resPacket = Helpers.mergeBytePacket(packetFlag, new byte[] {(byte)serverVersionMain}, new byte[] {(byte)serverVersionUpdate}, new byte[] {(byte)serverVersionMaintenance });
            sessionHandler.sendOneSession(session, resPacket);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resCheckAuthentication(WebSocketSession session, ErrorCheckAuth error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_CHECK_AUTHENTICATION, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resCheckAuthentication(WebSocketSession session, User user, String accessTokenString, String refreshTokenString) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_CHECK_AUTHENTICATION, ErrorCheckAuth.NONE);
            var bytesHaveProfile = new byte[] {(byte)user.getHaveProfile()};
            var bytesUserLatestActive = Helpers.getByteArrayFromLong(user.getLatestActiveAt().getTime());
            var bytesNickNameLength = new byte[] {(byte)user.getNickName().getBytes().length};
            var bytesMessageLength = new byte[] {(byte)user.getMessage().getBytes().length};
            var bytesAccessTokenStringLength = Helpers.getByteArrayFromShortInt(accessTokenString.getBytes().length);
            var bytesRefreshTokenStringLength = Helpers.getByteArrayFromShortInt(refreshTokenString.getBytes().length);
            var bytesNickName = user.getNickName().getBytes();
            var bytesMessage = user.getMessage().getBytes();
            var bytesAccessTokenString = accessTokenString.getBytes();
            var bytesRefreshTokenString = refreshTokenString.getBytes();
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesHaveProfile, bytesUserLatestActive, bytesNickNameLength, bytesMessageLength, bytesAccessTokenStringLength, bytesRefreshTokenStringLength, bytesNickName, bytesMessage, bytesAccessTokenString, bytesRefreshTokenString);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resSignIn(WebSocketSession session, ErrorSignIn error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_SIGN_IN, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resSignOut(WebSocketSession session, ErrorSignOut error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_SIGN_OUT, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resDemandRefreshToken(WebSocketSession session, String userId) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_DEMAND_REFRESH_TOKEN);
            var bytesUserId = new byte[0];
            if (!userId.isEmpty())
                bytesUserId = Helpers.getByteArrayFromUUID(userId);

            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserId);

            sessionHandler.sendOneSession(session, resPacket);
            sessionHandler.consoleLogPackets(packetFlag, ResType.RES_DEMAND_REFRESH_TOKEN.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public boolean resIsTokenExpired(WebSocketSession session, User user, String tokenString) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_ACCESS_TOKEN_EXPIRED);
            var bytesUserId = new byte[0];
            if (!user.getId().isEmpty())
                bytesUserId = Helpers.getByteArrayFromUUID(user.getId());

            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserId);
            var verifiedResult = jwtService.verifyToken(tokenString);
            switch (verifiedResult.getLeft()) {
                case NONE:
                    return false;

                case TOKEN_EXPIRED, DISPOSED_TOKEN:
                    userService.removeConnectedUser(user);
                    noticeDisconnectedUser(session, user);
                    sessionHandler.sendOneSession(session, resPacket);
                    return true;

                default:
                    sessionHandler.sendOneSession(session, resPacket);
                    return true;
            }
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return true;
        }
    }

    @Async
    public void resAccessTokenExpired(WebSocketSession session, String userId) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_ACCESS_TOKEN_EXPIRED);
            var bytesUserId = new byte[0];
            if (!userId.isEmpty())
                bytesUserId = Helpers.getByteArrayFromUUID(userId);

            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserId);

            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resRefreshTokenExpired(WebSocketSession session, String userId) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_REFRESH_TOKEN_EXPIRED);
            var bytesUserId = new byte[0];
            if (!userId.isEmpty())
                bytesUserId = Helpers.getByteArrayFromUUID(userId);

            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserId);

            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resCheckNotification(WebSocketSession session, ErrorCheckNotification error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_CHECK_NOTIFICATION, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resCheckNotification(WebSocketSession session, Notification notification) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_CHECK_NOTIFICATION, ErrorCheckNotification.NONE);
            var bytesId = Helpers.getByteArrayFromUUID(notification.getId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesId);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resRemoveNotification(WebSocketSession session, ErrorRemoveNotification error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_REMOVE_NOTIFICATION, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resRemoveNotification(WebSocketSession session, String id) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_REMOVE_NOTIFICATION, ErrorRemoveNotification.NONE);
            var bytesId = Helpers.getByteArrayFromUUID(id);
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesId);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public byte[] getNotificationPacket(Notification notification) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTIFICATION);
            var bytesNotificationType = new byte[]{notification.getNotificationType().getByte()};
            var bytesId = Helpers.getByteArrayFromUUID(notification.getId());
            var bytesSendAt = Helpers.getByteArrayFromLong(notification.getSendAt().getTime());
            var bytesIsCheck = new byte[]{(byte)(notification.isCheck() ? 1 : 0)};
            var bytesTargetId = Helpers.getByteArrayFromUUID(notification.getTargetId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesNotificationType, bytesId, bytesSendAt, bytesIsCheck, bytesTargetId);
            if (NotificationType.START_CHAT.equals(notification.getNotificationType()) || NotificationType.ADD_USER_CHAT_ROOM.equals(notification.getNotificationType())) {
                var bytesChatRoomId = Helpers.getByteArrayFromUUID(notification.getUrl());
                resPacket = Helpers.mergeBytePacket(resPacket, bytesChatRoomId);
            }
            return resPacket;
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return new byte[0];
        }
    }

    @Async
    public void resNotificationFollower(User follower, User follow) {
        try {
            var notification = notificationService.createNotificationFollow(follower, follow);
            if (notification.isEmpty())
                return;

            var optSession = getSessionByUserId(follow.getId());
            if (optSession.isEmpty())
                return;

            var resPacket = getNotificationPacket(notification.get());
            sessionHandler.sendOneSession(optSession.get(), resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resNotificationStartChat(User startUser, ChatRoom chatRoom) {
        try {
            if (chatRoom.getUsers().isEmpty())
                return;

            for (var userRoom : chatRoom.getUsers().values()) {
                if (userRoom.getUserId().equals(startUser.getId()))
                    continue;

                var notification = notificationService.createNotificationStartChat(chatRoom, startUser.getId(), userRoom.getUserId());
                if (notification.isEmpty())
                    continue;

                var optSession = getSessionByUserId(userRoom.getUserId());
                if (optSession.isEmpty())
                    continue;

                var resPacket = getNotificationPacket(notification.get());
                sessionHandler.sendOneSession(optSession.get(), resPacket);
            }
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resNotificationAddUserChatRoom(User sendUser, ChatRoom chatRoom, List<String> addedUserIds) {
        try {
            if (addedUserIds.isEmpty()) {
                logger.info("addedUserIds is empty.");
                return;
            }

            for (String userId : addedUserIds) {
                if (userId.equals(sendUser.getId())) {
                    logger.info("this is sender id.");
                    continue;
                }

                var notification = notificationService.createNotificationAddUserChatRoom(chatRoom, sendUser.getId(), userId);
                if (notification.isEmpty()) {
                    logger.info("notification is empty.");
                    continue;
                }

                var optSession = getSessionByUserId(userId);
                if (optSession.isEmpty()) {
                    logger.info("target user session is empty.");
                    continue;
                }

                var resPacket = getNotificationPacket(notification.get());
                sessionHandler.sendOneSession(optSession.get(), resPacket);
            }
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resNotifications(WebSocketSession session, List<Notification> notifications) {
        try {
            var startChatNotifications = notifications.stream().filter(notification -> notification.getNotificationType().equals(NotificationType.START_CHAT)).toList();
            if (!startChatNotifications.isEmpty()) {
                var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTIFICATIONS_START_CHAT);
                var bytesNotificationCount = new byte[] {(byte)startChatNotifications.size()};
                var bytesIds = new byte[0];
                var bytesSendAts = new byte[0];
                var bytesIsChecks = new byte[0];
                var bytesTargetIds = new byte[0];
                var bytesChatRoomIds = new byte[0];
                for (int i = 0; i < startChatNotifications.size(); i++) {
                    var notification = startChatNotifications.get(i);
                    bytesIds = Helpers.mergeBytePacket(bytesIds, Helpers.getByteArrayFromUUID(notification.getId()));
                    bytesSendAts = Helpers.mergeBytePacket(bytesSendAts, Helpers.getByteArrayFromLong(notification.getSendAt().getTime()));
                    bytesIsChecks = Helpers.mergeBytePacket(bytesIsChecks, new byte[] {(byte)(notification.isCheck() ? 1 : 0)});
                    bytesTargetIds = Helpers.mergeBytePacket(bytesTargetIds, Helpers.getByteArrayFromUUID(notification.getTargetId()));
                    bytesChatRoomIds = Helpers.mergeBytePacket(bytesChatRoomIds, Helpers.getByteArrayFromUUID(notification.getUrl()));
                }
                var resPacket = Helpers.mergeBytePacket(packetFlag, bytesNotificationCount, bytesIds, bytesSendAts, bytesIsChecks, bytesTargetIds, bytesChatRoomIds);
                sessionHandler.consoleLogPackets(resPacket, "startChatNotifications");
                sessionHandler.sendOneSession(session, resPacket);
            }
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }

        try {
            var followerNotifications = notifications.stream().filter(notification -> notification.getNotificationType().equals(NotificationType.FOLLOWER)).toList();
            if (!followerNotifications.isEmpty()) {
                var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTIFICATIONS_FOLLOWER);
                var bytesNotificationCount = new byte[] {(byte)followerNotifications.size()};
                var bytesIds = new byte[0];
                var bytesSendAts = new byte[0];
                var bytesIsChecks = new byte[0];
                var bytesTargetIds = new byte[0];
                for (int i = 0; i < followerNotifications.size(); i++) {
                    var notification = followerNotifications.get(i);
                    bytesIds = Helpers.mergeBytePacket(bytesIds, Helpers.getByteArrayFromUUID(notification.getId()));
                    bytesSendAts = Helpers.mergeBytePacket(bytesSendAts, Helpers.getByteArrayFromLong(notification.getSendAt().getTime()));
                    bytesIsChecks = Helpers.mergeBytePacket(bytesIsChecks, new byte[] {(byte)(notification.isCheck() ? 1 : 0)});
                    bytesTargetIds = Helpers.mergeBytePacket(bytesTargetIds, Helpers.getByteArrayFromUUID(notification.getTargetId()));
                }
                var resPacket = Helpers.mergeBytePacket(packetFlag, bytesNotificationCount, bytesIds, bytesSendAts, bytesIsChecks, bytesTargetIds);
                sessionHandler.consoleLogPackets(resPacket, "followerNotifications");
                sessionHandler.sendOneSession(session, resPacket);
            }
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resConnectedUsers(WebSocketSession session) {
        try {
            var resPacket = getConnectedUsersPackets();
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void noticeConnectedUsers() {
        try {
            var resPacket = getConnectedUsersPackets();
            sessionHandler.sendAll(resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public byte[] getConnectedUsersPackets() {
        var resPacket = new byte[0];
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_CONNECTED_USERS);
            var bytesIds = new byte[0];
            if (!userService.getConnectedUsers().isEmpty()) {
                for (User user : userService.getConnectedUsers()) {
                    bytesIds = Helpers.mergeBytePacket(bytesIds, Helpers.getByteArrayFromUUID(user.getId()));
                }
            }

            resPacket = Helpers.mergeBytePacket(packetFlag, bytesIds);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
        return resPacket;
    }

    @Async
    public void resLatestActiveUsers(WebSocketSession session) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_LATEST_ACTIVE_USERS);
            var bytesIds = new byte[0];
            var latestActiveUsers = userService.getLatestActiveUsers();
            if (!latestActiveUsers.isEmpty()) {
                for (User user : latestActiveUsers) {
                    bytesIds = Helpers.mergeBytePacket(bytesIds, Helpers.getByteArrayFromUUID(user.getId()));
                }
            }

            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesIds);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resGetTokenUserInfo(WebSocketSession session, ErrorGetTokenUserInfo error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_GET_TOKEN_USER_INFO, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resGetTokenUserInfo(WebSocketSession session, User user) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_GET_TOKEN_USER_INFO, ErrorGetTokenUserInfo.NONE);
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());
            var bytesHaveProfile = new byte[] {(byte)user.getHaveProfile()};
            var bytesNickNameLength = new byte[] {(byte)user.getNickName().getBytes().length};
            var bytesNickName = user.getNickName().getBytes();
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserId, bytesHaveProfile, bytesNickNameLength, bytesNickName);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resGetOthersUserInfo(WebSocketSession session, ErrorGetOthersUserInfo error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_GET_OTHERS_USER_INFO, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resGetOthersUserInfo(WebSocketSession session, User user) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_GET_OTHERS_USER_INFO, ErrorGetOthersUserInfo.NONE);
            var bytesHaveProfile = new byte[] {(byte)user.getHaveProfile()};
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());
            var bytesLatestActive = Helpers.getByteArrayFromLong(user.getLatestActiveAt().getTime());
            var bytesOnline = new byte[] {(byte)(userService.isConnectedUser(user.getId()) ? 1 : 0)};
            var bytesNickName = user.getNickName().getBytes();
            var bytesNickNameLength = new byte[] {(byte)bytesNickName.length};
            var bytesMessage = user.getMessage().getBytes();
            var bytesMessageLength = new byte[] {(byte)bytesMessage.length};
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesHaveProfile, bytesUserId, bytesLatestActive, bytesOnline, bytesNickNameLength, bytesMessageLength, bytesNickName, bytesMessage);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resFollows(WebSocketSession session, ConcurrentLinkedQueue<UserInterface> follows) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_FOLLOWS);
            var bytesIds = new byte[0];
            if (!follows.isEmpty()) {
                for (var user : follows) {
                    bytesIds = Helpers.mergeBytePacket(bytesIds, Helpers.getByteArrayFromUUID(user.getId()));
                }
            }

            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesIds);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resFollowers(WebSocketSession session, ConcurrentLinkedQueue<UserInterface> followers) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_FOLLOWERS);
            var bytesIds = new byte[0];
            if (!followers.isEmpty()) {
                for (var user : followers) {
                    bytesIds = Helpers.mergeBytePacket(bytesIds, Helpers.getByteArrayFromUUID(user.getId()));
                }
            }

            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesIds);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resChatRooms(WebSocketSession session, List<ChatRoomInfoInterface> chatRooms) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_CHAT_ROOMS);

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

            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesChatRoomCount, bytesRoomIds, bytesRoomOpenTypes, bytesUserCounts, bytesRoomNameLengths, bytesRoomNames);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void noticeConnectedUser(WebSocketSession session, User user) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTICE_CONNECTED_USER);
            var bytesId = Helpers.getByteArrayFromUUID(user.getId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesId);
            sessionHandler.sendOthers(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void noticeDisconnectedUser(WebSocketSession closedSession, User user) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTICE_DISCONNECTED_USER);
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserId);
            sessionHandler.sendOthers(closedSession, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resFollow(WebSocketSession session, ErrorFollow error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_FOLLOW, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resFollow(WebSocketSession session, User user) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_FOLLOW, ErrorFollow.NONE);
            var bytesId = Helpers.getByteArrayFromUUID(user.getId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesId);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resFollower(User targetUser, User user) {
        try {
            var connectedTargetUser = userService.getConnectedUserByUserId(targetUser.getId());
            if (connectedTargetUser.isEmpty() || connectedTargetUser.get().getSessionId().isEmpty())
                return;

            var optSession = sessionHandler.getSession(connectedTargetUser.get().getSessionId());
            if (optSession.isEmpty())
                return;

            var packetFlag = Helpers.getPacketFlag(ResType.RES_FOLLOWER);
            var bytesId = Helpers.getByteArrayFromUUID(user.getId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesId);
            sessionHandler.sendOneSession(optSession.get(), resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resUnfollow(WebSocketSession session, ErrorUnfollow error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_UNFOLLOW, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resUnfollow(WebSocketSession session, User user) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_UNFOLLOW, ErrorUnfollow.NONE);
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserId);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resUnfollower(User targetUser, User user) {
        try {
            var connectedTargetUser = userService.getConnectedUserByUserId(targetUser.getId());
            if (connectedTargetUser.isEmpty() || connectedTargetUser.get().getSessionId().isEmpty())
                return;

            var optSession = sessionHandler.getSession(connectedTargetUser.get().getSessionId());
            if (optSession.isEmpty())
                return;

            var packetFlag = Helpers.getPacketFlag(ResType.RES_UNFOLLOWER);
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserId);
            sessionHandler.sendOneSession(optSession.get(), resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resStartChat(WebSocketSession session, ErrorStartChat error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_START_CHAT, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resStartChat(WebSocketSession session, ChatRoom chatRoom) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_START_CHAT, ErrorStartChat.NONE);
            var bytesRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
            var bytesRoomOpenType = new byte[]{chatRoom.getOpenType().getByte()};
            var bytesUserCount = Helpers.getByteArrayFromInt(chatRoom.getUsers().size());
            var bytesRoomNameLength = new byte[]{(byte)chatRoom.getRoomName().getBytes().length};
            var bytesRoomName = chatRoom.getRoomName().getBytes();
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesRoomId, bytesRoomOpenType, bytesUserCount, bytesRoomNameLength, bytesRoomName);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resOpenPreparedChatRoom(WebSocketSession session, ChatRoom chatRoom) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_OPEN_PREPARED_CHAT_ROOM);
            var bytesRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesRoomId);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void noticeNickNameChanged(WebSocketSession session, User user, String newNickName) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTICE_NICK_NAME_CHANGED);
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserId, newNickName.getBytes());
            sessionHandler.sendOthers(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void noticeUserMessageChanged(WebSocketSession session, User user, String newUserMessage) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTICE_USER_MESSAGE_CHANGED);
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserId, newUserMessage.getBytes());
            sessionHandler.sendOthers(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void noticeRoomNickNameChanged(ChatRoom chatRoom, String oldNickName, String newNickName) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTICE_CHANGE_NICK_NAME_CHAT_ROOM);
            var resPacket = Helpers.mergeBytePacket(
                    packetFlag,
                    Helpers.getByteArrayFromUUID(chatRoom.getRoomId()),
                    (new byte[] {(byte) oldNickName.getBytes().length}),
                    oldNickName.getBytes(),
                    newNickName.getBytes()
            );
            sessionHandler.sendEachSessionInRoom(chatRoom, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resChangeUserProfile(WebSocketSession session, ErrorChangeUserProfile error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_CHANGE_USER_PROFILE, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void noticeUserProfileChanged(WebSocketSession session, User user) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTICE_USER_PROFILE_CHANGED);
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserId);
            sessionHandler.sendOthers(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resRemoveUserProfile(WebSocketSession session, ErrorRemoveUserProfile error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_REMOVE_USER_PROFILE, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void noticeUserProfileRemoved(WebSocketSession session, User user) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTICE_USER_PROFILE_REMOVED);
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserId);
            sessionHandler.sendOthers(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resCreateChatRoom(WebSocketSession session, ErrorCreateChatRoom error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_CREATE_CHAT_ROOM, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resCreateChatRoom(WebSocketSession session, ChatRoom chatRoom) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_CREATE_CHAT_ROOM, ErrorCreateChatRoom.NONE);
            var bytesRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesRoomId);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resAddUserChatRoom(WebSocketSession session, ErrorAddUserChatRoom error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_ADD_USER_CHAT_ROOM, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public CompletableFuture<Boolean> resAddChatRoom(WebSocketSession session, ChatRoom chatRoom) {
        try {
            var resPacket = getAddChatRoomPackets(chatRoom);
            switch (chatRoom.getOpenType()) {
                case PREPARED:
                    sessionHandler.sendOneSession(session, resPacket);
                    break;

                case PRIVATE:
                    if (chatRoom.getUsers().isEmpty())
                        return CompletableFuture.completedFuture(false);

                    sessionHandler.sendEachSessionInRoom(chatRoom, resPacket);
                    break;

                case PUBLIC:
                    sessionHandler.sendAll(resPacket);
                    break;
            }
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return CompletableFuture.completedFuture(false);
        }
        return CompletableFuture.completedFuture(true);
    }

    private byte[] getAddChatRoomPackets(ChatRoom chatRoom) throws Exception {
        var resPacket = new byte[0];
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_ADD_CHAT_ROOM);
            var bytesAddRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
            var bytesAddRoomOpenType = Helpers.getPacketFlag(chatRoom.getOpenType());
            var bytesAddRoomUserCount = Helpers.getByteArrayFromInt(chatRoom.getUsers().size());
            var bytesAddRoomName = chatRoom.getRoomName().getBytes();
            resPacket = Helpers.mergeBytePacket(packetFlag, bytesAddRoomId, bytesAddRoomOpenType, bytesAddRoomUserCount, bytesAddRoomName);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }

        return resPacket;
    }

    @Async
    public void resRemoveChatRoom(WebSocketSession session, ErrorRemoveChatRoom error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_REMOVE_CHAT_ROOM, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resRemoveChatRoom(WebSocketSession session, ChatRoom chatRoom) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_REMOVE_CHAT_ROOM, ErrorRemoveChatRoom.NONE);
            var bytesRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesRoomId);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resEnterChatRoom(WebSocketSession session, ErrorEnterChatRoom error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_ENTER_CHAT_ROOM, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resEnterChatRoom(WebSocketSession session, ChatRoom chatRoom) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_ENTER_CHAT_ROOM, ErrorEnterChatRoom.NONE);
            var bytesRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesRoomId);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void noticeEnterChatRoom(ChatRoom chatRoom, User user) {
        try {
            if (!chatRoom.getOpenType().equals(RoomOpenType.PUBLIC))
                return;

            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTICE_ENTER_CHAT_ROOM);
            var bytesRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesRoomId, user.getNickName().getBytes());

            sessionHandler.sendEachSessionInRoom(chatRoom, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resUpdateChatRoom(WebSocketSession session, ChatRoom chatRoom) {
        try {
            if (chatRoom.getUsers().isEmpty())
                return;

            var packetFlag = Helpers.getPacketFlag(ResType.RES_UPDATE_CHAT_ROOM);
            var bytesRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());

            // 입장한 사용자 숫자는 int32
            var bytesUserCount = Helpers.getByteArrayFromInt(chatRoom.getUsers().size());

            var bytesUserIds = new byte[0];
            var userIds = chatRoom.getUsers().keys();
            while (userIds.hasMoreElements()) {
                var userId = userIds.nextElement();
                bytesUserIds = Helpers.mergeBytePacket(bytesUserIds, Helpers.getByteArrayFromUUID(userId));
            }

            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesRoomId, bytesUserCount, bytesUserIds);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void noticeAddChatRoomUser(ChatRoom chatRoom, User user) {
        try {
            if (chatRoom.getUsers().isEmpty())
                return;

            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTICE_ADD_CHAT_ROOM_USER);
            var bytesRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());

            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesRoomId, bytesUserId);
            sessionHandler.sendEachSessionInRoom(chatRoom, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void noticeRemoveChatRoomUser(ChatRoom chatRoom, User user) {
        try {
            if (chatRoom.getUsers().isEmpty())
                return;

            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTICE_REMOVE_CHAT_ROOM_USER);
            var bytesRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());

            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesRoomId, bytesUserId);
            sessionHandler.sendEachSessionInRoom(chatRoom, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resHistoryChatRoom(WebSocketSession session, ChatRoom chatRoom) {
        try {
            if (chatRoom.getChats().isEmpty())
                return;

            var packetFlag = Helpers.getPacketFlag(ResType.RES_HISTORY_CHAT_ROOM);
            var bytesHistoryCount = Helpers.getByteArrayFromInt(chatRoom.getChats().size());
            var bytesHistoryRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
            var bytesHistoryChatId = new byte[0];
            var bytesHistoryUserId = new byte[0];
            var bytesHistoryChatType = new byte[0];
            var bytesHistorySendAt = new byte[0];
            var bytesHistoryMessageLength = new byte[0];
            var bytesHistoryMessage = new byte[0];

            for (Chat chat : chatRoom.getChats()) {
                bytesHistoryChatId = Helpers.mergeBytePacket(bytesHistoryChatId, Helpers.getByteArrayFromUUID(chat.getChatId()));
                bytesHistoryUserId = Helpers.mergeBytePacket(bytesHistoryUserId, Helpers.getByteArrayFromUUID(chat.getUserId()));
                bytesHistoryChatType = Helpers.mergeBytePacket(bytesHistoryChatType, new byte[] {chat.getType().getByte()});
                bytesHistorySendAt = Helpers.mergeBytePacket(bytesHistorySendAt, Helpers.getByteArrayFromLong(chat.getSendAt().getTime()));
                bytesHistoryMessageLength = Helpers.mergeBytePacket(bytesHistoryMessageLength, Helpers.getByteArrayFromInt(chat.getMessage().getBytes().length));
                bytesHistoryMessage = Helpers.mergeBytePacket(bytesHistoryMessage, chat.getMessage().getBytes());
            }

            var resPacket = Helpers.mergeBytePacket(
                    packetFlag,
                    bytesHistoryCount,
                    bytesHistoryRoomId,
                    bytesHistoryChatId,
                    bytesHistoryUserId,
                    bytesHistoryChatType,
                    bytesHistorySendAt,
                    bytesHistoryMessageLength,
                    bytesHistoryMessage
            );
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void resExitChatRoom(WebSocketSession session, ErrorExitChatRoom error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_EXIT_CHAT_ROOM, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void noticeRoomUserExited(ChatRoom chatRoom, User user) {
        try {
            if (!chatRoom.getOpenType().equals(RoomOpenType.PUBLIC))
                return;

            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTICE_EXIT_CHAT_ROOM);
            var resPacket = Helpers.mergeBytePacket(packetFlag, Helpers.getByteArrayFromUUID(chatRoom.getRoomId()), user.getNickName().getBytes());
            sessionHandler.sendEachSessionInRoom(chatRoom, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage());
        }
    }

    @Async
    public void resTalkChatRoom(WebSocketSession session, ErrorTalkChatRoom error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_TALK_CHAT_ROOM, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void noticeTalkChatRoom(ChatRoom chatRoom, Chat chat) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_TALK_CHAT_ROOM, ErrorTalkChatRoom.NONE);

            var bytesRoomId = Helpers.getByteArrayFromUUID(chat.getRoomId());
            var bytesUserId = Helpers.getByteArrayFromUUID(chat.getUserId());
            var bytesChatId = Helpers.getByteArrayFromUUID(chat.getChatId());
            var bytesChatMessageBytesLength = Helpers.getByteArrayFromInt(chat.getMessage().getBytes().length);
            var bytesChatMessage = chat.getMessage().getBytes();
            var bytesNow = Helpers.getByteArrayFromLong(chat.getSendAt().getTime());

            var talkPacket = Helpers.mergeBytePacket(
                    (new byte[]{chat.getType().getByte()}),
                    bytesRoomId,
                    bytesUserId,
                    bytesChatId,
                    bytesNow,
                    bytesChatMessageBytesLength,
                    bytesChatMessage
            );

            var resPacket = Helpers.mergeBytePacket(packetFlag, talkPacket);
            sessionHandler.sendEachSessionInRoom(chatRoom, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage());
        }
    }

}
