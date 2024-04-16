package com.zangho.game.server.socketHandler.chat;

import com.zangho.game.server.define.NotificationType;
import com.zangho.game.server.define.ResType;
import com.zangho.game.server.define.RoomOpenType;
import com.zangho.game.server.domain.chat.Chat;
import com.zangho.game.server.domain.chat.ChatRoom;
import com.zangho.game.server.domain.chat.ChatRoomInfoInterface;
import com.zangho.game.server.domain.chat.UserRoom;
import com.zangho.game.server.domain.user.Notification;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.domain.user.UserInterface;
import com.zangho.game.server.error.*;
import com.zangho.game.server.helper.Helpers;
import com.zangho.game.server.service.NotificationService;
import com.zangho.game.server.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.socket.WebSocketSession;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentLinkedQueue;

public class ResHandler {

    private final Logger logger = LoggerFactory.getLogger(ResHandler.class);
    private final boolean isDevelopment;
    private final SessionHandler sessionHandler;
    private final UserService userService;
    private final NotificationService notificationService;

    @Value("${server.version.main}")
    private int serverVersionMain;
    @Value("${server.version.update}")
    private int serverVersionUpdate;
    @Value("${server.version.maintenance}")
    private int serverVersionMaintenance;

    public ResHandler(SessionHandler sessionHandler, UserService userService, NotificationService notificationService) {
        var config = System.getProperty("Config");
        isDevelopment = null == config || !config.equals("production");
        this.sessionHandler = sessionHandler;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    public Optional<WebSocketSession> getSessionByUserId(String userId) {
        var connectedOtherUser = userService.getConnectedUserByUserId(userId);
        if (connectedOtherUser.isEmpty() || connectedOtherUser.get().getSessionId().isEmpty())
            return Optional.empty();

        return sessionHandler.getSession(connectedOtherUser.get().getSessionId());
    }

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

    public void resCheckAuthentication(WebSocketSession session, ErrorCheckAuth error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_CHECK_AUTHENTICATION, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void resCheckAuthentication(WebSocketSession session, User user) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_CHECK_AUTHENTICATION, ErrorCheckAuth.NONE);
            var bytesHaveProfile = new byte[] {(byte)user.getHaveProfile()};
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());
            var bytesUserLatestActive = Helpers.getByteArrayFromLong(user.getLatestActiveAt().getTime());
            var bytesUserNameLength = new byte[] {(byte)user.getName().getBytes().length};
            var bytesMessageLength = new byte[] {(byte)user.getMessage().getBytes().length};
            var bytesUserName = user.getName().getBytes();
            var bytesMessage = user.getMessage().getBytes();
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesHaveProfile, bytesUserId, bytesUserLatestActive, bytesUserNameLength, bytesMessageLength, bytesUserName, bytesMessage);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void resCheckNotification(WebSocketSession session, ErrorCheckNotification error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_CHECK_NOTIFICATION, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

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

    public void resRemoveNotification(WebSocketSession session, ErrorRemoveNotification error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_REMOVE_NOTIFICATION, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

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
            var bytesNotificationType = new byte[]{notification.getType().getByte()};
            var bytesId = Helpers.getByteArrayFromUUID(notification.getId());
            var bytesSendAt = Helpers.getByteArrayFromLong(notification.getSendAt().getTime());
            var bytesIsCheck = new byte[]{(byte)(notification.isCheck() ? 1 : 0)};
            var bytesTargetId = Helpers.getByteArrayFromUUID(notification.getTargetId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesNotificationType, bytesId, bytesSendAt, bytesIsCheck, bytesTargetId);
            switch (notification.getType()) {
                case START_CHAT:
                    var bytesChatRoomId = Helpers.getByteArrayFromUUID(notification.getUrl());
                    resPacket = Helpers.mergeBytePacket(resPacket, bytesChatRoomId);
                    break;
            }
            return resPacket;
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return new byte[0];
        }
    }

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

    public void resNotificationStartChat(User startUser, ChatRoom chatRoom) {
        try {
            if (chatRoom.getUsers().isEmpty())
                return;

            for (UserRoom userRoom : chatRoom.getUsers().values()) {
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

    public void resNotificationAddChatRoom(User sendUser, ChatRoom chatRoom, List<String> addedUsers) {
        try {
            if (chatRoom.getUsers().isEmpty())
                return;

//            for (UserRoom userRoom : chatRoom.getUsers().values()) {
//                if (userRoom.getUserId().equals(startUser.getId()))
//                    continue;
//
//                var notification = notificationService.createNotificationStartChat(chatRoom, startUser.getId(), userRoom.getUserId());
//                if (notification.isEmpty())
//                    continue;
//
//                var optSession = getSessionByUserId(userRoom.getUserId());
//                if (optSession.isEmpty())
//                    continue;
//
//                var resPacket = getNotificationPacket(notification.get());
//                sessionHandler.sendOneSession(optSession.get(), resPacket);
//            }
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void resNotifications(WebSocketSession session, List<Notification> notifications) {
        try {
            var startChatNotifications = notifications.stream().filter(notification -> notification.getType().equals(NotificationType.START_CHAT)).toList();
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
            var followerNotifications = notifications.stream().filter(notification -> notification.getType().equals(NotificationType.FOLLOWER)).toList();
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

    public void resConnectedUsers(WebSocketSession session) {
        try {
            var resPacket = getConnectedUsersPackets();
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

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

    public void resGetUserInfo(WebSocketSession session, ErrorGetUserInfo error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_GET_USER_INFO, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void resGetUserInfo(WebSocketSession session, User user) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_GET_USER_INFO, ErrorGetUserInfo.NONE);
            var bytesHaveProfile = new byte[] {(byte)user.getHaveProfile()};
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());
            var bytesLatestActive = Helpers.getByteArrayFromLong(user.getLatestActiveAt().getTime());
            var bytesOnline = new byte[] {(byte)(userService.isConnectedUser(user.getId()) ? 1 : 0)};
            var bytesUserName = user.getName().getBytes();
            var bytesUserNameLength = new byte[] {(byte)bytesUserName.length};
            var bytesMessage = user.getMessage().getBytes();
            var bytesMessageLength = new byte[] {(byte)bytesMessage.length};
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesHaveProfile, bytesUserId, bytesLatestActive, bytesOnline, bytesUserNameLength, bytesMessageLength, bytesUserName, bytesMessage);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

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

    public void resFollow(WebSocketSession session, ErrorFollow error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_FOLLOW, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

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

    public void resUnfollow(WebSocketSession session, ErrorUnfollow error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_UNFOLLOW, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

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

    public void resStartChat(WebSocketSession session, ErrorStartChat error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_START_CHAT, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

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

    public void noticeUserNameChanged(WebSocketSession session, User user, String newUserName) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTICE_USER_NAME_CHANGED);
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserId, newUserName.getBytes());
            sessionHandler.sendOthers(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

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

    public void noticeRoomUserNameChanged(ChatRoom chatRoom, String oldUserName, String newUserName) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTICE_CHANGE_NAME_CHAT_ROOM);
            var resPacket = Helpers.mergeBytePacket(
                    packetFlag,
                    Helpers.getByteArrayFromUUID(chatRoom.getRoomId()),
                    (new byte[] {(byte) oldUserName.getBytes().length}),
                    oldUserName.getBytes(),
                    newUserName.getBytes()
            );
            sessionHandler.sendEachSessionInRoom(chatRoom, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void resChangeUserProfile(WebSocketSession session, ErrorChangeUserProfile error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_CHANGE_USER_PROFILE, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

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

    public void resRemoveUserProfile(WebSocketSession session, ErrorRemoveUserProfile error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_REMOVE_USER_PROFILE, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

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

    public void resCreateChatRoom(WebSocketSession session, ErrorCreateChatRoom error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_CREATE_CHAT_ROOM, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

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

    public void resAddUserChatRoom(WebSocketSession session, ErrorAddUserChatRoom error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_ADD_USER_CHAT_ROOM, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void resAddChatRoom(WebSocketSession session, ChatRoom chatRoom) {
        try {
            var resPacket = getAddChatRoomPackets(chatRoom);
            switch (chatRoom.getOpenType()) {
                case PREPARED:
                    sessionHandler.sendOneSession(session, resPacket);
                    break;

                case PRIVATE:
                    if (chatRoom.getUsers().isEmpty())
                        return;

                    sessionHandler.sendEachSessionInRoom(chatRoom, resPacket);
                    break;

                case PUBLIC:
                    sessionHandler.sendAll(resPacket);
                    break;
            }
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
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

    public void resRemoveChatRoom(WebSocketSession session, ErrorRemoveChatRoom error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_REMOVE_CHAT_ROOM, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

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

    public void resEnterChatRoom(WebSocketSession session, ErrorEnterChatRoom error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_ENTER_CHAT_ROOM, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

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

    public void noticeEnterChatRoom(ChatRoom chatRoom, User user) {
        try {
            if (!chatRoom.getOpenType().equals(RoomOpenType.PUBLIC))
                return;

            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTICE_ENTER_CHAT_ROOM);
            var bytesRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesRoomId, user.getName().getBytes());

            sessionHandler.sendEachSessionInRoom(chatRoom, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

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

    public void resExitChatRoom(WebSocketSession session, ErrorExitChatRoom error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_EXIT_CHAT_ROOM, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void noticeRoomUserExited(ChatRoom chatRoom, User user) {
        try {
            if (!chatRoom.getOpenType().equals(RoomOpenType.PUBLIC))
                return;

            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTICE_EXIT_CHAT_ROOM);
            var resPacket = Helpers.mergeBytePacket(packetFlag, Helpers.getByteArrayFromUUID(chatRoom.getRoomId()), user.getName().getBytes());
            sessionHandler.sendEachSessionInRoom(chatRoom, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage());
        }
    }

    public void resTalkChatRoom(WebSocketSession session, ErrorTalkChatRoom error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_TALK_CHAT_ROOM, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

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
