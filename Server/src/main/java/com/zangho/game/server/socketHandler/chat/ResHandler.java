package com.zangho.game.server.socketHandler.chat;

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
import com.zangho.game.server.service.NotificationService;
import com.zangho.game.server.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.socket.WebSocketSession;

import java.util.List;
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

    public void resNotificationFollower(User follower, User follow) {
        try {
            var notification = notificationService.createFollowNotification(follower, follow);
            if (notification.isEmpty())
                return;

            var connectedFollowUser = userService.getConnectedUserByUserId(follow.getId());
            if (connectedFollowUser.isEmpty() || connectedFollowUser.get().getSessionId().isEmpty())
                return;

            var optSession = sessionHandler.getSession(connectedFollowUser.get().getSessionId());
            if (optSession.isEmpty())
                return;

            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTIFICATION);
            var bytesNotificationType = new byte[]{notification.get().getType().getByte()};
            var bytesId = Helpers.getByteArrayFromUUID(notification.get().getId());
            var bytesSendAt = Helpers.getByteArrayFromLong(notification.get().getSendAt().getTime());
            var bytesIsCheck = new byte[]{0};
            var bytesHaveIcon = new byte[]{(byte)follower.getHaveProfile()};
            var bytesFollowerId = Helpers.getByteArrayFromUUID(follower.getId());
            var bytesFollowerNameLength = new byte[]{(byte)follower.getName().getBytes().length};
            var bytesFollowerName = follower.getName().getBytes();
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesNotificationType, bytesId, bytesSendAt, bytesIsCheck, bytesHaveIcon, bytesFollowerId, bytesFollowerNameLength, bytesFollowerName);
            sessionHandler.sendOneSession(optSession.get(), resPacket);
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
            var bytesUserCount = Helpers.getByteArrayFromInt(userService.getConnectedUsers().size());
            var bytesHaveProfiles = new byte[0];
            var bytesIds = new byte[0];
            var bytesLatestActives = new byte[0];
            var bytesNameLengths = new byte[0];
            var bytesMessageLengths = new byte[0];
            var bytesNames = new byte[0];
            var bytesMessages = new byte[0];
            if (!userService.getConnectedUsers().isEmpty()) {
                for (User user : userService.getConnectedUsers()) {
                    bytesHaveProfiles = Helpers.mergeBytePacket(bytesHaveProfiles, new byte[] {(byte)user.getHaveProfile()});
                    bytesIds = Helpers.mergeBytePacket(bytesIds, Helpers.getByteArrayFromUUID(user.getId()));
                    bytesLatestActives = Helpers.mergeBytePacket(bytesLatestActives, Helpers.getByteArrayFromLong(user.getLatestActiveAt().getTime()));
                    bytesNameLengths = Helpers.mergeBytePacket(bytesNameLengths, new byte[]{(byte)user.getName().getBytes().length});
                    bytesMessageLengths = Helpers.mergeBytePacket(bytesMessageLengths, new byte[]{(byte)user.getMessage().getBytes().length});
                    bytesNames = Helpers.mergeBytePacket(bytesNames, user.getName().getBytes());
                    bytesMessages = Helpers.mergeBytePacket(bytesMessages, user.getMessage().getBytes());
                }
            }

            resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserCount, bytesHaveProfiles, bytesIds, bytesLatestActives, bytesNameLengths, bytesMessageLengths, bytesNames, bytesMessages);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
        return resPacket;
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
            var bytesUserCount = Helpers.getByteArrayFromInt(follows.size());
            var bytesHaveProfiles = new byte[0];
            var bytesIds = new byte[0];
            var bytesLatestActives = new byte[0];
            var bytesOnlines = new byte[0];
            var bytesNameLengths = new byte[0];
            var bytesMessageLengths = new byte[0];
            var bytesNames = new byte[0];
            var bytesMessages = new byte[0];
            if (!follows.isEmpty()) {
                for (var user : follows) {
                    bytesHaveProfiles = Helpers.mergeBytePacket(bytesHaveProfiles, new byte[] {(byte)user.getHaveProfile()});
                    bytesIds = Helpers.mergeBytePacket(bytesIds, Helpers.getByteArrayFromUUID(user.getId()));
                    bytesLatestActives = Helpers.mergeBytePacket(bytesLatestActives, Helpers.getByteArrayFromLong(user.getLatestActiveAt().getTime()));
                    bytesOnlines = Helpers.mergeBytePacket(bytesOnlines, new byte[]{(byte)(userService.isConnectedUser(user) ? 1 : 0)});
                    bytesNameLengths = Helpers.mergeBytePacket(bytesNameLengths, new byte[]{(byte)user.getName().getBytes().length});
                    bytesMessageLengths = Helpers.mergeBytePacket(bytesMessageLengths, new byte[]{(byte)user.getMessage().getBytes().length});
                    bytesNames = Helpers.mergeBytePacket(bytesNames, user.getName().getBytes());
                    bytesMessages = Helpers.mergeBytePacket(bytesMessages, user.getMessage().getBytes());
                }
            }

            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserCount, bytesHaveProfiles, bytesIds, bytesLatestActives, bytesOnlines, bytesNameLengths, bytesMessageLengths, bytesNames, bytesMessages);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void resFollowers(WebSocketSession session, ConcurrentLinkedQueue<UserInterface> followers) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_FOLLOWERS);
            var bytesUserCount = Helpers.getByteArrayFromInt(followers.size());
            var bytesHaveProfiles = new byte[0];
            var bytesIds = new byte[0];
            var bytesLatestActives = new byte[0];
            var bytesOnlines = new byte[0];
            var bytesNameLengths = new byte[0];
            var bytesMessageLengths = new byte[0];
            var bytesNames = new byte[0];
            var bytesMessages = new byte[0];
            if (!followers.isEmpty()) {
                for (var user : followers) {
                    bytesHaveProfiles = Helpers.mergeBytePacket(bytesHaveProfiles, new byte[] {(byte)user.getHaveProfile()});
                    bytesIds = Helpers.mergeBytePacket(bytesIds, Helpers.getByteArrayFromUUID(user.getId()));
                    bytesLatestActives = Helpers.mergeBytePacket(bytesLatestActives, Helpers.getByteArrayFromLong(user.getLatestActiveAt().getTime()));
                    bytesOnlines = Helpers.mergeBytePacket(bytesOnlines, new byte[]{(byte)(userService.isConnectedUser(user) ? 1 : 0)});
                    bytesNameLengths = Helpers.mergeBytePacket(bytesNameLengths, new byte[]{(byte)user.getName().getBytes().length});
                    bytesMessageLengths = Helpers.mergeBytePacket(bytesMessageLengths, new byte[]{(byte)user.getMessage().getBytes().length});
                    bytesNames = Helpers.mergeBytePacket(bytesNames, user.getName().getBytes());
                    bytesMessages = Helpers.mergeBytePacket(bytesMessages, user.getMessage().getBytes());
                }
            }

            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserCount, bytesHaveProfiles, bytesIds, bytesLatestActives, bytesOnlines, bytesNameLengths, bytesMessageLengths, bytesNames, bytesMessages);
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
            var bytesHaveProfile = new byte[] {(byte)user.getHaveProfile()};
            var bytesId = Helpers.getByteArrayFromUUID(user.getId());
            var bytesLatestActive = Helpers.getByteArrayFromLong(user.getLatestActiveAt().getTime());
            var bytesOnline = new byte[]{(byte)(userService.isConnectedUser(user) ? 1 : 0)};
            var bytesNameLength = new byte[]{(byte)user.getName().getBytes().length};
            var bytesMessageLength = new byte[]{(byte)user.getMessage().getBytes().length};
            var bytesName = user.getName().getBytes();
            var bytesMessage = user.getMessage().getBytes();
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesHaveProfile, bytesId, bytesLatestActive, bytesOnline, bytesNameLength, bytesMessageLength, bytesName, bytesMessage);
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
            var bytesHaveProfile = new byte[] {(byte)user.getHaveProfile()};
            var bytesId = Helpers.getByteArrayFromUUID(user.getId());
            var bytesLatestActive = Helpers.getByteArrayFromLong(user.getLatestActiveAt().getTime());
            var bytesOnline = new byte[]{(byte)(userService.isConnectedUser(user) ? 1 : 0)};
            var bytesNameLength = new byte[]{(byte)user.getName().getBytes().length};
            var bytesMessageLength = new byte[]{(byte)user.getMessage().getBytes().length};
            var bytesName = user.getName().getBytes();
            var bytesMessage = user.getMessage().getBytes();
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesHaveProfile, bytesId, bytesLatestActive, bytesOnline, bytesNameLength, bytesMessageLength, bytesName, bytesMessage);
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
            var bytesHaveProfile = new byte[] {(byte)user.getHaveProfile()};
            var bytesId = Helpers.getByteArrayFromUUID(user.getId());
            var bytesLatestActive = Helpers.getByteArrayFromLong(user.getLatestActiveAt().getTime());
            var bytesOnline = new byte[]{(byte)(userService.isConnectedUser(user) ? 1 : 0)};
            var bytesNameLength = new byte[]{(byte)user.getName().getBytes().length};
            var bytesMessageLength = new byte[]{(byte)user.getMessage().getBytes().length};
            var bytesName = user.getName().getBytes();
            var bytesMessage = user.getMessage().getBytes();
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesHaveProfile, bytesId, bytesLatestActive, bytesOnline, bytesNameLength, bytesMessageLength, bytesName, bytesMessage);
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

    public void resStartChat(WebSocketSession session, ChatRoom chatRoom, User targetUser) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_START_CHAT, ErrorStartChat.NONE);
            var bytesRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
            var bytesRoomOpenType = new byte[]{chatRoom.getOpenType().getByte()};
            var bytesUserCount = Helpers.getByteArrayFromInt(chatRoom.getUsers().size());
            var bytesRoomNameLength = new byte[]{(byte)chatRoom.getRoomName().getBytes().length};
            var bytesRoomName = chatRoom.getRoomName().getBytes();
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesRoomId, bytesRoomOpenType, bytesUserCount, bytesRoomNameLength, bytesRoomName);
            sessionHandler.sendOneSession(session, resPacket);

            var connectedTargetUser = userService.getConnectedUserByUserId(targetUser.getId());
            if (connectedTargetUser.isEmpty() || connectedTargetUser.get().getSessionId().isEmpty())
                return;

            var optSession = sessionHandler.getSession(connectedTargetUser.get().getSessionId());
//            if (optSession.isPresent())
//                return;
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

    public void resAddChatRoom(WebSocketSession session, ChatRoom chatRoom) {
        try {
            var resPacket = getAddChatRoomPackets(chatRoom);
            switch (chatRoom.getOpenType()) {
                case PRIVATE:
                    sessionHandler.sendOneSession(session, resPacket);
                    break;

                case PUBLIC:
                    sessionHandler.sendAll(resPacket);
                    break;
            }
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void resAddChatRoom(ChatRoom chatRoom) {
        try {
            var resPacket = getAddChatRoomPackets(chatRoom);
            switch (chatRoom.getOpenType()) {
                case PRIVATE:
                    if (chatRoom.getUsers().isEmpty())
                        return;

                    logger.info("resAddChatRoom: " + chatRoom.getOpenType().name() + ", users: " + chatRoom.getUsers().size());
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

    public void noticeUpdateChatRoom(ChatRoom chatRoom) {
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
                var optUser = userService.getConnectedUserByUserId(userId);
                if (optUser.isEmpty())
                    continue;

                var user = optUser.get();
                bytesUserIds = Helpers.mergeBytePacket(bytesUserIds, Helpers.getByteArrayFromUUID(user.getId()));
            }

            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesRoomId, bytesUserCount, bytesUserIds);
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
