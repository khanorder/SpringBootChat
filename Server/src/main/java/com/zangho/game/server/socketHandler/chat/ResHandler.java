package com.zangho.game.server.socketHandler.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zangho.game.server.define.ResType;
import com.zangho.game.server.domain.chat.Chat;
import com.zangho.game.server.domain.chat.ChatRoom;
import com.zangho.game.server.domain.chat.ChatRoomInfoInterface;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.error.*;
import com.zangho.game.server.helper.Helpers;
import com.zangho.game.server.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.WebSocketSession;

import java.util.List;

public class ResHandler {

    private final Logger logger = LoggerFactory.getLogger(ResHandler.class);
    private final boolean isDevelopment;
    private final SessionHandler sessionHandler;
    private final UserService userService;

    public ResHandler(SessionHandler sessionHandler, UserService userService) {
        var config = System.getProperty("Config");
        isDevelopment = null == config || !config.equals("production");
        this.sessionHandler = sessionHandler;
        this.userService = userService;
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

    public void resCheckAuthentication(WebSocketSession session, User user, List<ChatRoomInfoInterface> chatRooms) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_CHECK_AUTHENTICATION, ErrorCheckAuth.NONE);
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());
            var bytesUserNameLength = new byte[] {(byte)user.getName().getBytes().length};
            var bytesUserName = user.getName().getBytes();
            var bytesFollowCount = Helpers.getByteArrayFromInt(user.getFollowList().size());
            var bytesFollowerCount = Helpers.getByteArrayFromInt(user.getFollowerList().size());
            var bytesChatRoomCount = Helpers.getByteArrayFromInt(chatRooms.size());
            var bytesFollowIds = new byte[0];
            var bytesFollowNameLengths = new byte[0];
            var bytesFollowNames = new byte[0];
            if (!user.getFollowList().isEmpty()) {
                for (var follow : user.getFollowList()) {
                    bytesFollowIds = Helpers.mergeBytePacket(bytesFollowIds, Helpers.getByteArrayFromUUID(follow.getId()));
                    bytesFollowNameLengths = Helpers.mergeBytePacket(bytesFollowNameLengths, new byte[]{(byte)follow.getName().getBytes().length});
                    bytesFollowNames = Helpers.mergeBytePacket(bytesFollowNames, follow.getName().getBytes());
                }
            }

            var bytesFollowerIds = new byte[0];
            var bytesFollowerNameLengths = new byte[0];
            var bytesFollowerNames = new byte[0];
            if (!user.getFollowerList().isEmpty()) {
                for (var follower : user.getFollowerList()) {
                    bytesFollowerIds = Helpers.mergeBytePacket(bytesFollowerIds, Helpers.getByteArrayFromUUID(follower.getId()));
                    bytesFollowerNameLengths = Helpers.mergeBytePacket(bytesFollowerNameLengths, new byte[]{(byte)follower.getName().getBytes().length});
                    bytesFollowerNames = Helpers.mergeBytePacket(bytesFollowerNames, follower.getName().getBytes());
                }
            }

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

            var resPacket = Helpers.mergeBytePacket(
                    packetFlag, bytesUserId, bytesUserNameLength, bytesUserName,
                    bytesFollowCount, bytesFollowerCount, bytesChatRoomCount,
                    bytesFollowIds, bytesFollowNameLengths, bytesFollowNames,
                    bytesFollowerIds, bytesFollowerNameLengths, bytesFollowerNames,
                    bytesRoomIds, bytesRoomOpenTypes, bytesUserCounts, bytesRoomNameLengths, bytesRoomNames
            );
            sessionHandler.sendOneSession(session, resPacket);
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
            var bytesUserIds = new byte[0];
            var bytesUserNameLengths = new byte[0];
            var bytesUserNames = new byte[0];
            if (!userService.getConnectedUsers().isEmpty()) {
                for (User user : userService.getConnectedUsers()) {
                    bytesUserIds = Helpers.mergeBytePacket(bytesUserIds, Helpers.getByteArrayFromUUID(user.getId()));
                    bytesUserNameLengths = Helpers.mergeBytePacket(bytesUserNameLengths, new byte[]{(byte)user.getName().getBytes().length});
                    bytesUserNames = Helpers.mergeBytePacket(bytesUserNames, user.getName().getBytes());
                }
            }

            resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserCount, bytesUserIds, bytesUserNameLengths, bytesUserNames);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
        return resPacket;
    }

    public void noticeConnectedUser(WebSocketSession session, User user) {
        try {
            var resPacket = getNoticeConnectedUserPackets(user);
            sessionHandler.sendOthers(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public byte[] getNoticeConnectedUserPackets(User user) {
        var resPacket = new byte[0];
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTICE_CONNECTED_USER);
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());
            var bytesUserNameLength = new byte[]{(byte)user.getName().getBytes().length};
            var bytesUserName = user.getName().getBytes();
            resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserId, bytesUserNameLength, bytesUserName);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
        return resPacket;
    }

    public void noticeDisconnectedUser(WebSocketSession closedSession, User user) {
        try {
            var resPacket = getNoticeDisconnectedUserPackets(user);
            sessionHandler.sendOthers(closedSession, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public byte[] getNoticeDisconnectedUserPackets(User user) {
        var resPacket = new byte[0];
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTICE_DISCONNECTED_USER);
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());
            resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserId);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
        return resPacket;
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
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());
            var bytesUserNameLength = new byte[]{(byte)user.getName().getBytes().length};
            var bytesUserName = user.getName().getBytes();
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserId, bytesUserNameLength, bytesUserName);
            sessionHandler.sendOneSession(session, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void resFollower(User targetUser, User user) {
        try {
            var connectedUser = userService.getConnectedUserByUserId(targetUser.getId());
            if (connectedUser.isEmpty() || connectedUser.get().getSessionId().isEmpty())
                return;

            var optSession = sessionHandler.getSession(connectedUser.get().getSessionId());
            if (optSession.isEmpty())
                return;

            var packetFlag = Helpers.getPacketFlag(ResType.RES_FOLLOWER);
            var bytesUserId = Helpers.getByteArrayFromUUID(user.getId());
            var bytesUserNameLength = new byte[]{(byte)user.getName().getBytes().length};
            var bytesUserName = user.getName().getBytes();
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesUserId, bytesUserNameLength, bytesUserName);
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
            var connectedUser = userService.getConnectedUserByUserId(targetUser.getId());
            if (connectedUser.isEmpty() || connectedUser.get().getSessionId().isEmpty())
                return;

            var optSession = sessionHandler.getSession(connectedUser.get().getSessionId());
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

    public void resCreateChatRoom(WebSocketSession session, ErrorCreateChatRoom error) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_CREATE_CHAT_ROOM, error);
            sessionHandler.sendOneSession(session, packetFlag);
            sessionHandler.consoleLogPackets(packetFlag, error.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void sendAddChatRoom(WebSocketSession session, ChatRoom chatRoom) {
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

    public void sendAddChatRoom(ChatRoom chatRoom) {
        try {
            var resPacket = getAddChatRoomPackets(chatRoom);
            switch (chatRoom.getOpenType()) {
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
        var packetFlag = Helpers.getPacketFlag(ResType.RES_ADD_CHAT_ROOM);
        var bytesAddRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
        var bytesAddRoomOpenType = Helpers.getPacketFlag(chatRoom.getOpenType());
        var bytesAddRoomUserCount = Helpers.getByteArrayFromInt(chatRoom.getUsers().size());
        var bytesAddRoomName = chatRoom.getRoomName().getBytes();
        return Helpers.mergeBytePacket(packetFlag, bytesAddRoomId, bytesAddRoomOpenType, bytesAddRoomUserCount, bytesAddRoomName);
    }

    private byte[] getRemoveChatRoomPackets(String roomId) throws Exception {
        var packetFlag = Helpers.getPacketFlag(ResType.RES_REMOVE_CHAT_ROOM);
        var bytesRemoveRoomId = Helpers.getByteArrayFromUUID(roomId);
        return Helpers.mergeBytePacket(packetFlag, bytesRemoveRoomId);
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
            var packetFlag = Helpers.getPacketFlag(ResType.RES_NOTICE_ENTER_CHAT_ROOM);
            var bytesRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());
            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesRoomId, user.getName().getBytes());

            sessionHandler.sendEachSessionInRoom(chatRoom, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void noticeRoomUsersChanged(ChatRoom chatRoom) {
        try {
            if (chatRoom.getUsers().isEmpty())
                return;

            var packetFlag = Helpers.getPacketFlag(ResType.RES_UPDATE_CHAT_ROOM);
            var bytesRoomId = Helpers.getByteArrayFromUUID(chatRoom.getRoomId());

            // 입장한 사용자 숫자는 int32
            var bytesUserCount = Helpers.getByteArrayFromInt(chatRoom.getUsers().size());

            var bytesUserIds = new byte[0];
            var bytesUserNameLengths = new byte[0];
            var bytesUserNames = new byte[0];
            var userIds = chatRoom.getUsers().keys();
            while (userIds.hasMoreElements()) {
                var userId = userIds.nextElement();
                var optUser = userService.getConnectedUserByUserId(userId);
                if (optUser.isEmpty())
                    continue;

                var user = optUser.get();
                bytesUserIds = Helpers.mergeBytePacket(bytesUserIds, Helpers.getByteArrayFromUUID(user.getId()));
                var bytesUserName = user.getName().getBytes();
                bytesUserNameLengths = Helpers.mergeBytePacket(bytesUserNameLengths, new byte[] {(byte)bytesUserName.length});
                bytesUserNames = Helpers.mergeBytePacket(bytesUserNames, bytesUserName);
            }

            var resPacket = Helpers.mergeBytePacket(packetFlag, bytesRoomId, bytesUserCount, bytesUserIds, bytesUserNameLengths, bytesUserNames);
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
            var bytesHistoryUserNameLength = new byte[0];
            var bytesHistoryMessageLength = new byte[0];
            var bytesHistoryUserName = new byte[0];
            var bytesHistoryMessage = new byte[0];

            for (Chat chat : chatRoom.getChats()) {
                bytesHistoryChatId = Helpers.mergeBytePacket(bytesHistoryChatId, Helpers.getByteArrayFromUUID(chat.getChatId()));
                bytesHistoryUserId = Helpers.mergeBytePacket(bytesHistoryUserId, Helpers.getByteArrayFromUUID(chat.getUserId()));
                bytesHistoryChatType = Helpers.mergeBytePacket(bytesHistoryChatType, new byte[] {chat.getType().getByte()});
                bytesHistorySendAt = Helpers.mergeBytePacket(bytesHistorySendAt, Helpers.getByteArrayFromLong(chat.getSendAt().getTime()));
                bytesHistoryUserNameLength = Helpers.mergeBytePacket(bytesHistoryUserNameLength, new byte[] {(byte)chat.getUserName().getBytes().length});
                bytesHistoryMessageLength = Helpers.mergeBytePacket(bytesHistoryMessageLength, Helpers.getByteArrayFromInt(chat.getMessage().getBytes().length));
                bytesHistoryUserName = Helpers.mergeBytePacket(bytesHistoryUserName, chat.getUserName().getBytes());
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
                    bytesHistoryUserNameLength,
                    bytesHistoryMessageLength,
                    bytesHistoryUserName,
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

    public void noticeTalkChatRoom(ChatRoom chatRoom, byte[] talkPacket) {
        try {
            var packetFlag = Helpers.getPacketFlag(ResType.RES_TALK_CHAT_ROOM, ErrorTalkChatRoom.NONE);
            var resPacket = Helpers.mergeBytePacket(packetFlag, talkPacket);
            sessionHandler.sendEachSessionInRoom(chatRoom, resPacket);
        } catch (Exception ex) {
            logger.error(ex.getMessage());
        }
    }

}
