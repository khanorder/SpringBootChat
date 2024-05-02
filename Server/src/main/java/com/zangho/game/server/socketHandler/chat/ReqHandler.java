package com.zangho.game.server.socketHandler.chat;

import com.zangho.game.server.define.*;
import com.zangho.game.server.domain.chat.Chat;
import com.zangho.game.server.domain.chat.ChatRoom;
import com.zangho.game.server.domain.chat.ChatRoomInfoInterface;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.error.*;
import com.zangho.game.server.helper.Helpers;
import com.zangho.game.server.service.*;
import lombok.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;

import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

public class ReqHandler {

    private final Logger logger = LoggerFactory.getLogger(ResHandler.class);
    private final boolean isDevelopment;
    private final SessionHandler sessionHandler;
    private final ResHandler resHandler;
    private final UserService userService;
    private final ChatRoomService chatRoomService;
    private final LineNotifyService lineNotifyService;
    private final MessageService messageService;
    private final NotificationService notificationService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Value("${client.version.main}")
    private int clientVersionMain;
    @Value("${client.version.update}")
    private int clientVersionUpdate;
    @Value("${client.version.maintenance}")
    private int clientVersionMaintenance;

    public ReqHandler(SessionHandler sessionHandler, ResHandler resHandler, UserService userService, ChatRoomService chatRoomService, LineNotifyService lineNotifyService, MessageService messageService, NotificationService notificationService, JwtService jwtService, PasswordEncoder passwordEncoder) {
        var config = System.getProperty("Config");
        isDevelopment = null == config || !config.equals("production");
        this.sessionHandler = sessionHandler;
        this.resHandler = resHandler;
        this.userService = userService;
        this.chatRoomService = chatRoomService;
        this.lineNotifyService = lineNotifyService;
        this.messageService = messageService;
        this.notificationService = notificationService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public void onAfterConnectionEstablished(@NonNull WebSocketSession session) {
        try {
            sessionHandler.addSession(session);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
        sessionHandler.consoleLogState("connected");
        lineNotifyService.Notify("채팅샘플 접속 (" + Helpers.getSessionIP(session) + ")");
    }

    public void onAfterConnectionClosed(@NonNull WebSocketSession closeSession, @NonNull CloseStatus status) {
        try {
            var user = userService.getConnectedUser(closeSession);
            if (user.isPresent()) {
                // 연결된 유저 정보 제거
                userService.removeConnectedUser(user.get());
                // 연결종료 전체알림
                resHandler.noticeDisconnectedUser(closeSession, user.get());
            }

            // 세션제거
            sessionHandler.removeSession(closeSession);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
        sessionHandler.consoleLogState("disconnected");
        lineNotifyService.Notify("채팅샘플 접속종료 (" + Helpers.getSessionIP(closeSession) + ")");
    }

    public void onCheckConnection(WebSocketSession session, byte[] packet) {
        try {
            if (4 > packet.length) {
                resHandler.resCheckConnection(session, ErrorCheckConnection.UPDATE_REQUIRED);
                return;
            }

            var sessionClientVersionMain = packet[1];

            if (clientVersionMain > sessionClientVersionMain) {
                resHandler.resCheckConnection(session, ErrorCheckConnection.UPDATE_REQUIRED);
                return;
            }

            if (clientVersionMain < sessionClientVersionMain) {
                resHandler.resCheckConnection(session, ErrorCheckConnection.NONE);
                return;
            }

            var sessionClientVersionUpdate = packet[2];

            if (clientVersionUpdate > sessionClientVersionUpdate) {
                resHandler.resCheckConnection(session, ErrorCheckConnection.UPDATE_REQUIRED);
                return;
            }

            if (clientVersionUpdate < sessionClientVersionUpdate) {
                resHandler.resCheckConnection(session, ErrorCheckConnection.NONE);
                return;
            }

            var sessionClientVersionMaintenance = packet[3];

            if (clientVersionMaintenance > sessionClientVersionMaintenance) {
                resHandler.resCheckConnection(session, ErrorCheckConnection.UPDATE_REQUIRED);
                return;
            }

            resHandler.resCheckConnection(session, ErrorCheckConnection.NONE);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onCheckAuthentication(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            if (connectedUser.isPresent()) {
                resHandler.resCheckAuthentication(session, ErrorCheckAuth.ALREADY_SIGN_IN_USER);
                return;
            }

            Optional<User> optUser = Optional.empty();
            List<ChatRoomInfoInterface> chatRooms = new ArrayList<>();
            var tokenString = "";
            var refreshTokenString = "";
            if (1 < packet.length) {
                var bytesTokenString = Arrays.copyOfRange(packet, 1, packet.length);
                tokenString = new String(bytesTokenString);
                var verifiedResult = jwtService.verifyToken(tokenString);

                switch (verifiedResult.getLeft()) {
                    case NONE:
                        if (verifiedResult.getRight().isEmpty()) {
                            resHandler.resCheckAuthentication(session, ErrorCheckAuth.TOKEN_IS_EMPTY);
                            return;
                        }
                        break;

                    case TOKEN_EXPIRED:
                        if (verifiedResult.getRight().isEmpty()) {
                            resHandler.resRefreshTokenExpired(session, "");
                        } else {
                            var token = verifiedResult.getRight().get();
                            if (TokenType.REFRESH.equals(token.getTokenType())) {
                                resHandler.resRefreshTokenExpired(session, token.getUserId());
                            } else {
                                resHandler.resDemandRefreshToken(session, token.getUserId());
                            }
                        }
                        return;

                    case DISPOSED_TOKEN:
                        if (verifiedResult.getRight().isEmpty()) {
                            resHandler.resRefreshTokenExpired(session, "");
                        } else {
                            var token = verifiedResult.getRight().get();
                            if (TokenType.REFRESH.equals(token.getTokenType())) {
                                resHandler.resRefreshTokenExpired(session, token.getUserId());
                            } else {
                                resHandler.resAccessTokenExpired(session, token.getUserId());
                            }
                        }
                        return;

                    default:
                        resHandler.resCheckAuthentication(session, ErrorCheckAuth.NOT_VALID_TOKEN);
                        return;
                }


                var token = verifiedResult.getRight().get();
                if (userService.isConnectedUser(token.getUserId())) {
                    resHandler.resCheckAuthentication(session, ErrorCheckAuth.ALREADY_SIGN_IN_USER);
                    return;
                }

                var authenticatedUserInfo = userService.authenticateUser(token.getUserId(), session);
                optUser = authenticatedUserInfo.getLeft();
                chatRooms = authenticatedUserInfo.getRight();

                if (optUser.isEmpty()) {
                    resHandler.resCheckAuthentication(session, ErrorCheckAuth.FAILED_TO_AUTH);
                    return;
                }

                // 인증확인 토큰이 리프레쉬 토크인 경우 토큰을 재 발행한다
                var optTokenType = TokenType.getType(token.getTokenType().getNumber());
                if (optTokenType.isPresent() && optTokenType.get().equals(TokenType.REFRESH)) {
                    var resultIssueToken = jwtService.issueAccessTokenWithRefresh(optUser.get());
                    if (resultIssueToken.getLeft().equals(ErrorIssueJWT.FAILED_TO_ISSUE)) {
                        // 토큰 재발행이 실패한 경우 메모리에서 인증 상태를 다시 제거한다.
                        userService.removeConnectedUser(optUser.get());
                        resHandler.resCheckAuthentication(session, ErrorCheckAuth.FAILED_TO_ISSUE_TOKEN);
                        return;
                    }

                    // 재발행 후 기존 리프레쉬 토큰은 패기
                    jwtService.disposeToken(token);
                    tokenString = resultIssueToken.getRight().getLeft();
                    refreshTokenString = resultIssueToken.getRight().getRight();
                }
            } else {
                optUser = userService.createTempUser(session);
                if (optUser.isEmpty()) {
                    resHandler.resCheckAuthentication(session, ErrorCheckAuth.FAILED_TO_CREATE_USER);
                    return;
                }

                var resultIssueToken = jwtService.issueAccessTokenWithRefresh(optUser.get());
                if (resultIssueToken.getLeft().equals(ErrorIssueJWT.FAILED_TO_ISSUE)) {
                    resHandler.resCheckAuthentication(session, ErrorCheckAuth.FAILED_TO_ISSUE_TOKEN);
                    return;
                }

                tokenString = resultIssueToken.getRight().getLeft();
                refreshTokenString = resultIssueToken.getRight().getRight();
            }


            // 팔로우, 팔로워, 사용 가능한 채팅방 정보 전달
            resHandler.resCheckAuthentication(session, optUser.get(), tokenString, refreshTokenString);
            resHandler.resLatestActiveUsers(session);
            resHandler.resConnectedUsers(session);
            resHandler.resFollows(session, optUser.get().getFollowList());
            resHandler.resFollowers(session, optUser.get().getFollowerList());
            resHandler.resChatRooms(session, chatRooms);

            var notifications = notificationService.findLatestByUserId(optUser.get().getId());
            if (!notifications.isEmpty())
                resHandler.resNotifications(session, notifications);

            // 접속 전체알림
            resHandler.noticeConnectedUser(session, optUser.get());
            userService.updateActiveUser(optUser.get());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onSignIn(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        if (connectedUser.isPresent()) {
            resHandler.resSignIn(session, ErrorSignIn.ALREADY_SIGN_IN);
            return;
        }

        var userNameLength = packet[1];
        var offsetUserNameLength = 2;
        var bytesUserName = Arrays.copyOfRange(packet, offsetUserNameLength, offsetUserNameLength + userNameLength);
        var userName = (new String(bytesUserName)).trim();
        var bytesPassword = Arrays.copyOfRange(packet, offsetUserNameLength + userNameLength, packet.length);
        var password = (new String(bytesPassword)).trim();

        if (userName.isEmpty()) {
            resHandler.resSignIn(session, ErrorSignIn.USER_NAME_REQUIRED);
            return;
        }

        if (password.isEmpty()) {
            resHandler.resSignIn(session, ErrorSignIn.PASSWORD_REQUIRED);
            return;
        }

        var optUser = userService.findByUserName(userName);
        if (optUser.isEmpty()) {
            if (isDevelopment)
                logger.info("SignIn : Not Found User '" + userName + "'.");

            resHandler.resSignIn(session, ErrorSignIn.FAILED_TO_SIGN_IN);
            return;
        }

        if (!AccountType.NORMAL.equals(optUser.get().getAccountType())) {
            if (isDevelopment)
                logger.info("SignIn : '" + userName + "' account is not normal type.");

            resHandler.resSignIn(session, ErrorSignIn.FAILED_TO_SIGN_IN);
            return;
        }

        if (!passwordEncoder.matches(password, optUser.get().getPassword())) {
            if (isDevelopment)
                logger.info("SignIn : '" + userName + "' password was wrong.");

            resHandler.resSignIn(session, ErrorSignIn.FAILED_TO_SIGN_IN);
            return;
        }

        if (userService.isConnectedUser(optUser.get())) {
            if (isDevelopment)
                logger.info("SignIn : Already Sign in User '" + userName + "'.");

            resHandler.resSignIn(session, ErrorSignIn.ALREADY_SIGN_IN);
            return;
        }

        var resultIssueToken = jwtService.issueAccessTokenWithRefresh(optUser.get());
        if (!ErrorIssueJWT.NONE.equals(resultIssueToken.getLeft()) || resultIssueToken.getRight().getLeft().isEmpty() || resultIssueToken.getRight().getRight().isEmpty()) {
            if (isDevelopment)
                logger.info("SignIn : '" + userName + "' failed to issue token.");

            resHandler.resSignIn(session, ErrorSignIn.FAILED_TO_SIGN_IN);
            return;
        }

        resHandler.resCheckAuthentication(session, optUser.get(), resultIssueToken.getRight().getLeft(), resultIssueToken.getRight().getRight());
    }

    public void onSignOut(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        if (connectedUser.isEmpty()) {
            resHandler.resSignOut(session, ErrorSignOut.AUTH_REQUIRED);
            return;
        }

        var bytesTokenString = Arrays.copyOfRange(packet, 1, packet.length);
        var tokenString = new String(bytesTokenString);
        if (resHandler.resIsTokenExpired(session, connectedUser.get(), tokenString))
            return;

        var resultDeserialize = jwtService.verifyAccessToken(tokenString);

        switch (resultDeserialize.getLeft()) {
            case NONE:
                if (resultDeserialize.getRight().isPresent()) {
                    var disposedToken = jwtService.disposeToken(resultDeserialize.getRight().get());
                    if (disposedToken.isEmpty()) {
                        resHandler.resSignOut(session, ErrorSignOut.FAILED_TO_SIGN_OUT);
                        return;
                    }
                }
                break;

            default:
                resHandler.resSignOut(session, ErrorSignOut.FAILED_TO_SIGN_OUT);
                return;
        }

        // 연결된 유저 정보 제거
        userService.removeConnectedUser(connectedUser.get());
        // 연결종료 전체알림
        resHandler.noticeDisconnectedUser(session, connectedUser.get());
        resHandler.resSignOut(session, ErrorSignOut.NONE);
    }

    public void onCheckNotification(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        if (connectedUser.isEmpty()) {
            resHandler.resCheckNotification(session, ErrorCheckNotification.AUTH_REQUIRED);
            return;
        }

        var bytesId = Arrays.copyOfRange(packet, 1, 17);
        var id = Helpers.getUUIDFromByteArray(bytesId);

        if (id.isEmpty()) {
            resHandler.resCheckNotification(session, ErrorCheckNotification.ID_REQUIRED);
            return;
        }

        var notification = notificationService.findById(id);
        if (notification.isEmpty()) {
            resHandler.resCheckNotification(session, ErrorCheckNotification.NOT_FOUND_NOTIFICATION);
            return;
        }

        if (notification.get().isCheck()) {
            resHandler.resCheckNotification(session, ErrorCheckNotification.ALREADY_CHECKED);
            return;
        }

        var result = notificationService.check(notification.get());

        if (result.isEmpty() || !result.get().isCheck()) {
            resHandler.resCheckNotification(session, ErrorCheckNotification.FAILED_TO_CHECK);
            return;
        }

        resHandler.resCheckNotification(session, result.get());
    }

    public void onRemoveNotification(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        if (connectedUser.isEmpty()) {
            resHandler.resRemoveNotification(session, ErrorRemoveNotification.AUTH_REQUIRED);
            return;
        }

        var bytesId = Arrays.copyOfRange(packet, 1, 17);
        var id = Helpers.getUUIDFromByteArray(bytesId);

        if (id.isEmpty()) {
            resHandler.resRemoveNotification(session, ErrorRemoveNotification.ID_REQUIRED);
            return;
        }

        var notification = notificationService.findById(id);
        if (notification.isEmpty()) {
            resHandler.resRemoveNotification(session, ErrorRemoveNotification.NOT_FOUND_NOTIFICATION);
            return;
        }

        var result = notificationService.remove(notification.get());

        if (!result) {
            resHandler.resRemoveNotification(session, ErrorRemoveNotification.FAILED_TO_REMOVE);
            return;
        }

        resHandler.resRemoveNotification(session, id);
    }

    public void onConnectedUsers(WebSocketSession session) {
        try {
            resHandler.resConnectedUsers(session);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onGetTokenUserInfo(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            var bytesTokenString = Arrays.copyOfRange(packet, 1, packet.length);
            var tokenString = new String(bytesTokenString);
            var verifiedResult = jwtService.verifyToken(tokenString);

            switch (verifiedResult.getLeft()) {
                case NONE:
                    if (verifiedResult.getRight().isEmpty()) {
                        resHandler.resGetTokenUserInfo(session, ErrorGetTokenUserInfo.NOT_VALID_TOKEN);
                        return;
                    }
                    break;

                case TOKEN_EXPIRED:
                    if (verifiedResult.getRight().isEmpty()) {
                        resHandler.resRefreshTokenExpired(session, "");
                    } else {
                        var token = verifiedResult.getRight().get();
                        if (TokenType.REFRESH.equals(token.getTokenType())) {
                            resHandler.resRefreshTokenExpired(session, token.getUserId());
                        } else {
                            resHandler.resDemandRefreshToken(session, token.getUserId());
                        }
                    }
                    return;

                case DISPOSED_TOKEN:
                    if (verifiedResult.getRight().isEmpty()) {
                        resHandler.resRefreshTokenExpired(session, "");
                    } else {
                        var token = verifiedResult.getRight().get();
                        if (TokenType.REFRESH.equals(token.getTokenType())) {
                            resHandler.resRefreshTokenExpired(session, token.getUserId());
                        } else {
                            resHandler.resAccessTokenExpired(session, token.getUserId());
                        }
                    }
                    return;

                default:
                    resHandler.resGetTokenUserInfo(session, ErrorGetTokenUserInfo.NOT_VALID_TOKEN);
                    return;
            }

            var token = verifiedResult.getRight().get();

            var optUser = userService.findUserById(token.getUserId());
            if (optUser.isEmpty()) {
                resHandler.resGetTokenUserInfo(session, ErrorGetTokenUserInfo.NOT_FOUND_USER);
                return;
            }

            resHandler.resGetTokenUserInfo(session, optUser.get());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            resHandler.resGetTokenUserInfo(session, ErrorGetTokenUserInfo.NOT_VALID_TOKEN);
        }
    }

    public void onGetOthersUserInfo(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            if (connectedUser.isEmpty()) {
                resHandler.resGetOthersUserInfo(session, ErrorGetOthersUserInfo.AUTH_REQUIRED);
                return;
            }

            var bytesUserId = Arrays.copyOfRange(packet, 1, 17);
            var userId = Helpers.getUUIDFromByteArray(bytesUserId);

            var optUser = userService.findUserById(userId);
            if (optUser.isEmpty()) {
                resHandler.resGetOthersUserInfo(session, ErrorGetOthersUserInfo.NOT_FOUND_USER);
                return;
            }

            resHandler.resGetOthersUserInfo(session, optUser.get());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onFollow(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            if (connectedUser.isEmpty()) {
                resHandler.resFollow(session, ErrorFollow.AUTH_REQUIRED);
                return;
            }

            var offsetUserId = 17;
            var bytesUserId = Arrays.copyOfRange(packet, 1, offsetUserId);
            var userId = Helpers.getUUIDFromByteArray(bytesUserId);
            var bytesToken = Arrays.copyOfRange(packet, offsetUserId, packet.length);
            var tokenString = new String(bytesToken);
            if (resHandler.resIsTokenExpired(session, connectedUser.get(), tokenString))
                return;

            var targetUser = userService.findUserById(userId);
            if (targetUser.isEmpty()) {
                resHandler.resFollow(session, ErrorFollow.NOT_FOUND_USER);
                return;
            }

            if (targetUser.get().getId().equals(connectedUser.get().getId())) {
                resHandler.resFollow(session, ErrorFollow.CAN_NOT_FOLLOW_SELF);
                return;
            }

            var exists = userService.findFollower(connectedUser.get(), targetUser.get());
            if (exists.isPresent()) {
                resHandler.resFollow(session, ErrorFollow.ALREADY_FOLLOWED);
                return;
            }

            var follow = userService.followUser(connectedUser.get(), targetUser.get());
            if (follow.isEmpty()) {
                resHandler.resFollow(session, ErrorFollow.FAILED_TO_FOLLOW);
                return;
            }

            resHandler.resFollow(session, targetUser.get());
            resHandler.resFollower(targetUser.get(), connectedUser.get());
            resHandler.resNotificationFollower(connectedUser.get(), targetUser.get());

            var userSubscriptions = userService.findUserSubscriptionsByUserId(targetUser.get().getId());
            if (!userSubscriptions.isEmpty()) {
                for (var userSubscription : userSubscriptions)
                    messageService.sendNotificationWithLink(userSubscription.getSubscription(), "새로운 팔로워", "'" + connectedUser.get().getNickName() + "'님이 당신을 팔로우 합니다.", "", "/images/profile/small/" + connectedUser.get().getId());
            }
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onUnfollow(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            if (connectedUser.isEmpty()) {
                resHandler.resUnfollow(session, ErrorUnfollow.AUTH_REQUIRED);
                return;
            }

            var offsetUserId = 17;
            var bytesUserId = Arrays.copyOfRange(packet, 1, offsetUserId);
            var userId = Helpers.getUUIDFromByteArray(bytesUserId);
            var bytesToken = Arrays.copyOfRange(packet, offsetUserId, packet.length);
            var tokenString = new String(bytesToken);
            if (resHandler.resIsTokenExpired(session, connectedUser.get(), tokenString))
                return;

            var targetUser = userService.findUserById(userId);
            if (targetUser.isEmpty()) {
                resHandler.resUnfollow(session, ErrorUnfollow.NOT_FOUND_USER);
                return;
            }

            if (targetUser.get().getId().equals(connectedUser.get().getId())) {
                resHandler.resUnfollow(session, ErrorUnfollow.CAN_NOT_UNFOLLOW_SELF);
                return;
            }

            var exists = userService.findFollower(connectedUser.get(), targetUser.get());
            if (exists.isEmpty()) {
                resHandler.resUnfollow(session, ErrorUnfollow.NOT_FOUND_FOLLOWED);
                return;
            }

            var result = userService.unfollowUser(exists.get());
            if (!result) {
                resHandler.resUnfollow(session, ErrorUnfollow.FAILED_TO_UNFOLLOW);
                return;
            }

            resHandler.resUnfollow(session, targetUser.get());
            resHandler.resUnfollower(targetUser.get(), connectedUser.get());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onStartChat(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            if (connectedUser.isEmpty()) {
                resHandler.resStartChat(session, ErrorStartChat.AUTH_REQUIRED);
                return;
            }

            var bytesTargetUserId = Arrays.copyOfRange(packet, 1, 17);
            var targetUserId = Helpers.getUUIDFromByteArray(bytesTargetUserId);
            var targetUser = userService.findUserById(targetUserId);
            if (targetUser.isEmpty()) {
                resHandler.resStartChat(session, ErrorStartChat.NOT_FOUND_TARGET_USER);
                return;
            }

            var oneToOneChatRoom = chatRoomService.startOneToOneChat(connectedUser.get(), targetUser.get());

            if (oneToOneChatRoom.isEmpty()) {
                resHandler.resStartChat(session, ErrorStartChat.FAILED_TO_START_CHAT);
                return;
            }

            resHandler.resStartChat(session, oneToOneChatRoom.get());
            resHandler.noticeEnterChatRoom(oneToOneChatRoom.get(), connectedUser.get());
            resHandler.resUpdateChatRoom(session, oneToOneChatRoom.get());
            resHandler.resHistoryChatRoom(session, oneToOneChatRoom.get());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onChangeNickName(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            var bytesUserId = Arrays.copyOfRange(packet, 1, 17);
            var userId = Helpers.getUUIDFromByteArray(bytesUserId);
            if (connectedUser.isEmpty() || !connectedUser.get().getId().equals(userId))
                return;

            var bytesNickName = Arrays.copyOfRange(packet, 17, packet.length);
            var newNickName = new String(bytesNickName);

            var oldNickName =  connectedUser.get().getNickName();
            connectedUser.get().setNickName(newNickName);
            var result = userService.saveUser(connectedUser.get());

            if (!result)
                return;
            
            // 다른 사용자들에게 대화명 변경 알림
            resHandler.noticeNickNameChanged(session, connectedUser.get(), newNickName);

            // 입장중인 채팅방이 있는지 확인
            if (connectedUser.get().getCurrentChatRoom().isEmpty())
                return;

            Optional<ChatRoom> currentChatRoom = chatRoomService.findRoomById(connectedUser.get().getCurrentChatRoom().get().getRoomId());
            
            if (currentChatRoom.isEmpty() || currentChatRoom.get().getUsers().isEmpty())
                return;
            
            // 채팅방 입장 중이면 입장한 유저들에게 대화명 변경 알림
            resHandler.noticeRoomNickNameChanged(currentChatRoom.get(), oldNickName, newNickName);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onChangeUserMessage(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            var bytesUserId = Arrays.copyOfRange(packet, 1, 17);
            var userId = Helpers.getUUIDFromByteArray(bytesUserId);
            if (connectedUser.isEmpty() || !connectedUser.get().getId().equals(userId))
                return;

            var bytesUserMessage = Arrays.copyOfRange(packet, 17, packet.length);
            var newUserMessage = new String(bytesUserMessage);
            connectedUser.get().setMessage(newUserMessage);
            var result = userService.saveUser(connectedUser.get());
            if (result)
                resHandler.noticeUserMessageChanged(session, connectedUser.get(), newUserMessage);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onChangeUserProfile(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            if (connectedUser.isEmpty()) {
                resHandler.resChangeUserProfile(session, ErrorChangeUserProfile.AUTH_REQUIRED);
                return;
            }

            var offsetMime = 2;
            var offsetBytesLargeImageLength = offsetMime + 4;
            var offsetBytesSmallImageLength = offsetBytesLargeImageLength + 4;
            var mimeNumber = packet[1];
            var optMime = AllowedImageType.getType(mimeNumber);
            if (optMime.isEmpty() || AllowedImageType.NONE.equals(optMime.get())) {
                resHandler.resChangeUserProfile(session, ErrorChangeUserProfile.NOT_ALLOWED_FIlE_TYPE);
                return;
            }

            var extension = Helpers.getImageExtension(optMime.get());
            var bytesLargeImageLength = Arrays.copyOfRange(packet, offsetMime, offsetBytesLargeImageLength);
            var bytesSmallImageLength = Arrays.copyOfRange(packet, offsetBytesLargeImageLength, offsetBytesSmallImageLength);
            var largeImageLength = Helpers.getIntFromByteArray(bytesLargeImageLength);
            var smallImageLength = Helpers.getIntFromByteArray(bytesSmallImageLength);
            var offsetBytesLargeImage = offsetBytesSmallImageLength + largeImageLength;
            var bytesLargeImage = Arrays.copyOfRange(packet, offsetBytesSmallImageLength, offsetBytesLargeImage);
            var bytesSmallImage = new byte[0];
            if (0 < smallImageLength)
                bytesSmallImage = Arrays.copyOfRange(packet, offsetBytesLargeImage, offsetBytesLargeImage + smallImageLength);

            var currentPath = System.getProperty("user.dir");
            var profilesSmallDirectoryPath = Paths.get(currentPath, "images", "profiles", "small");
            var profilesLargeDirectoryPath = Paths.get(currentPath, "images", "profiles", "large");
            if (!Files.isDirectory(profilesSmallDirectoryPath))
                Files.createDirectories(profilesSmallDirectoryPath);

            if (!Files.isDirectory(profilesLargeDirectoryPath))
                Files.createDirectories(profilesLargeDirectoryPath);

            var fileName = Helpers.getBase62FromUUID(UUID.randomUUID().toString());
            var largeImagePath = Paths.get(profilesLargeDirectoryPath.toString(), fileName + "." + extension);
            var fosLarge = new FileOutputStream(largeImagePath.toString());
            fosLarge.write(bytesLargeImage);
            fosLarge.flush();
            fosLarge.close();

            if (0 < smallImageLength) {
                var smallImagePath = Paths.get(profilesSmallDirectoryPath.toString(), fileName + "." + extension);
                var fosSmall = new FileOutputStream(smallImagePath.toString());
                fosSmall.write(bytesSmallImage);
                fosSmall.flush();
                fosSmall.close();
            }

            var existsMime = connectedUser.get().getProfileMime();
            var existsProfile = connectedUser.get().getProfileImage();

            connectedUser.get().setProfileMime(optMime.get());
            connectedUser.get().setProfileImage(fileName);
            var result = userService.saveUser(connectedUser.get());
            if (!result) {
                resHandler.resChangeUserProfile(session, ErrorChangeUserProfile.FAILED_TO_CHANGE);
                return;
            }

            resHandler.resChangeUserProfile(session, ErrorChangeUserProfile.NONE);
            resHandler.noticeUserProfileChanged(session, connectedUser.get());

            if (0 < existsMime.getNumber() && !existsProfile.isEmpty()) {
                var existsFileName = existsProfile + "." + Helpers.getImageExtension(existsMime);
                var existsLargeImagePath = Paths.get(profilesLargeDirectoryPath.toString(), existsFileName);
                Files.deleteIfExists(existsLargeImagePath);
                var existsSmallImagePath = Paths.get(profilesSmallDirectoryPath.toString(), existsFileName);
                Files.deleteIfExists(existsSmallImagePath);
            }
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onRemoveUserProfile(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        if (connectedUser.isEmpty()) {
            resHandler.resRemoveUserProfile(session, ErrorRemoveUserProfile.AUTH_REQUIRED);
            return;
        }

        try {
            var existsMime = connectedUser.get().getProfileMime();
            var existsProfile = connectedUser.get().getProfileImage();

            if (0 < existsMime.getNumber() && !existsProfile.isEmpty()) {
                var currentPath = System.getProperty("user.dir");
                var profilesSmallDirectoryPath = Paths.get(currentPath, "images", "profiles", "small");
                var profilesLargeDirectoryPath = Paths.get(currentPath, "images", "profiles", "large");

                var existsFileName = existsProfile + "." + Helpers.getImageExtension(existsMime);
                var existsLargeImagePath = Paths.get(profilesLargeDirectoryPath.toString(), existsFileName);
                Files.deleteIfExists(existsLargeImagePath);
                var existsSmallImagePath = Paths.get(profilesSmallDirectoryPath.toString(), existsFileName);
                Files.deleteIfExists(existsSmallImagePath);
            }
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }

        try {
            connectedUser.get().setProfileMime(AllowedImageType.NONE);
            connectedUser.get().setProfileImage("");
            var result = userService.saveUser(connectedUser.get());
            if (!result) {
                resHandler.resRemoveUserProfile(session, ErrorRemoveUserProfile.FAILED_TO_REMOVE);
                return;
            }

            resHandler.resRemoveUserProfile(session, ErrorRemoveUserProfile.NONE);
            resHandler.noticeUserProfileRemoved(session, connectedUser.get());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onCreateChatRoom(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            if (connectedUser.isEmpty() || connectedUser.get().getId().isEmpty()) {
                resHandler.resCreateChatRoom(session, ErrorCreateChatRoom.AUTH_REQUIRED);
                return;
            }

            var roomOpenType = RoomOpenType.getType(packet[1]);
            if (roomOpenType.isEmpty() || (!roomOpenType.get().equals(RoomOpenType.PRIVATE) && !roomOpenType.get().equals(RoomOpenType.PUBLIC))) {
                resHandler.resCreateChatRoom(session, ErrorCreateChatRoom.NOT_ALLOWED_OPEN_TYPE);
                return;
            }

            var offsetRoomOpenType = 2;
            var offsetUserCount = offsetRoomOpenType + 4;
            var bytesUserCount = Arrays.copyOfRange(packet, offsetRoomOpenType, offsetUserCount);
            var userCount = Helpers.getIntFromByteArray(bytesUserCount);
            var offsetUserId = offsetUserCount + (16 * userCount);
            List<String> userIds = new ArrayList<>();
            for (int i = 0; i < userCount; i++) {
                var bytesUserId = Arrays.copyOfRange(packet, offsetUserCount + (i * 16), offsetUserCount + ((i + 1) * 16));
                userIds.add(Helpers.getUUIDFromByteArray(bytesUserId));
            }

            var roomName = "";
            if (packet.length > offsetUserId) {
                var bytesRoomName = Arrays.copyOfRange(packet, offsetUserId, packet.length);
                roomName = new String(bytesRoomName);
            } else {
                roomName = connectedUser.get().getNickName();
                if (0 < userCount) {
                    roomName += " 외 " + userCount + "명";
                } else {
                    roomName += " 개설 채팅방";
                }
            }

            var chatRoom = chatRoomService.createRoom(roomName, connectedUser.get(), RoomOpenType.PRIVATE == roomOpenType.get() ? RoomOpenType.PREPARED : roomOpenType.get());
            if (chatRoom.isEmpty()) {
                resHandler.resCreateChatRoom(session, ErrorCreateChatRoom.FAILED_TO_CREATE);
                return;
            }

            var bytesRoomId = Helpers.getByteArrayFromUUID(chatRoom.get().getRoomId());
            if (0 == bytesRoomId.length) {
                resHandler.resCreateChatRoom(session, ErrorCreateChatRoom.REQUIRED_ROOM_ID);
                return;
            }

            if (!userIds.isEmpty()) {
                for (int i = 0; i < userIds.size(); i++) {
                    var userId = userIds.get(i);
                    chatRoomService.addUserToRoom(userId, chatRoom.get());
                }
            }

            if (isDevelopment)
                logger.info(chatRoom.get().getOpenType().getNumber() + ", " + chatRoom.get().getRoomId() + ", " + roomName + ", " + connectedUser.get().getId() + ", " + connectedUser.get().getNickName());

            resHandler.resAddChatRoom(session, chatRoom.get());
            resHandler.resCreateChatRoom(session, chatRoom.get());
            resHandler.resUpdateChatRoom(session, chatRoom.get());
            lineNotifyService.Notify("채팅방 개설 (roomName:" + roomName + ", userId:" + connectedUser.get().getId() + ", nickName:" + connectedUser.get().getNickName() + ", ip: " + Helpers.getSessionIP(session) + ")");
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onAddUserChatRoom(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            if (connectedUser.isEmpty() || connectedUser.get().getId().isEmpty()) {
                resHandler.resCreateChatRoom(session, ErrorCreateChatRoom.AUTH_REQUIRED);
                return;
            }

            var offsetRoomId = 17;
            var bytesRoomId = Arrays.copyOfRange(packet, 1, offsetRoomId);
            var roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
            var offsetUserCount = offsetRoomId + 4;
            var bytesUserCount = Arrays.copyOfRange(packet, offsetRoomId, offsetUserCount);
            var userCount = Helpers.getIntFromByteArray(bytesUserCount);
            List<String> userIds = new ArrayList<>();
            for (int i = 0; i < userCount; i++) {
                var bytesUserId = Arrays.copyOfRange(packet, offsetUserCount + (i * 16), offsetUserCount + ((i + 1) * 16));
                userIds.add(Helpers.getUUIDFromByteArray(bytesUserId));
            }

            if (1 > userCount || userIds.isEmpty()) {
                resHandler.resAddUserChatRoom(session, ErrorAddUserChatRoom.ONE_MORE_USERS_REQUIRED);
                return;
            }

            var optChatRoom = chatRoomService.findRoomById(roomId);

            if (optChatRoom.isEmpty()) {
                resHandler.resAddUserChatRoom(session, ErrorAddUserChatRoom.NOT_FOUND_ROOM);
                return;
            }

            for (String userId : userIds) {
                chatRoomService.addUserToRoom(userId, optChatRoom.get());
            }

            resHandler.resAddChatRoom(session, optChatRoom.get());
            resHandler.resUpdateChatRoom(session, optChatRoom.get());
            resHandler.resNotificationAddUserChatRoom(connectedUser.get(), optChatRoom.get(), userIds);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onRemoveChatRoom(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            if (connectedUser.isEmpty() || connectedUser.get().getId().isEmpty()) {
                resHandler.resRemoveChatRoom(session, ErrorRemoveChatRoom.AUTH_REQUIRED);
                return;
            }

            if (17 > packet.length) {
                resHandler.resRemoveChatRoom(session, ErrorRemoveChatRoom.REQUIRED_ROOM_ID);
                return;
            }

            var bytesRoomId = Arrays.copyOfRange(packet, 1, 17);
            var roomId = Helpers.getUUIDFromByteArray(bytesRoomId);

            if (roomId.isEmpty()) {
                resHandler.resRemoveChatRoom(session, ErrorRemoveChatRoom.REQUIRED_ROOM_ID);
                return;
            }

            var result = chatRoomService.removeUserRoom(roomId, connectedUser.get());

            if (ErrorRemoveChatRoom.NONE == result.getLeft()) {
                if (result.getRight().isEmpty()) {
                    resHandler.resRemoveChatRoom(session, ErrorRemoveChatRoom.NOT_FOUND_CHAT_ROOM);
                } else {
                    resHandler.resRemoveChatRoom(session, result.getRight().get());
                    resHandler.noticeRemoveChatRoomUser(result.getRight().get(), connectedUser.get());
                    resHandler.noticeRoomUserExited(result.getRight().get(), connectedUser.get());
                }
            } else {
                resHandler.resRemoveChatRoom(session, result.getLeft());
            }

        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onEnterChatRoom(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            if (connectedUser.isEmpty() || connectedUser.get().getId().isEmpty()) {
                resHandler.resEnterChatRoom(session, ErrorEnterChatRoom.AUTH_REQUIRED);
                return;
            }

            var bytesRoomId = Arrays.copyOfRange(packet, 1, 17);
            var roomId = Helpers.getUUIDFromByteArray(bytesRoomId);

            var result = chatRoomService.enterRoom(roomId, connectedUser.get());
            if (!result.getLeft().equals(ErrorEnterChatRoom.NONE) || result.getRight().isEmpty()) {
                resHandler.resEnterChatRoom(session, result.getLeft());
                return;
            }

            var existsRoom = result.getRight();

            resHandler.resAddChatRoom(session, existsRoom.get());
            resHandler.resUpdateChatRoom(session, existsRoom.get());
            resHandler.resEnterChatRoom(session, existsRoom.get());
            resHandler.resHistoryChatRoom(session, existsRoom.get());
            resHandler.noticeEnterChatRoom(existsRoom.get(), connectedUser.get());
            resHandler.noticeAddChatRoomUser(existsRoom.get(), connectedUser.get());

            //messageService.notifyBrowserUserInRoom(existsRoom.get(), "채팅방 입장", "'" + connectedUser.get().getNickName() + "'님이 대화방에 입장했습니다.");
            lineNotifyService.Notify("채팅방 입장 (roomName:" + existsRoom.get().getRoomName() + ", userId:" + connectedUser.get().getId() + ", nickName:" + connectedUser.get().getNickName() + ", ip: " + Helpers.getSessionIP(session) + ")");
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onExitChatRoom(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            var roomIdBytes = Arrays.copyOfRange(packet, 1, packet.length);
            var roomId = Helpers.getUUIDFromByteArray(roomIdBytes);

            if (connectedUser.isEmpty()) {
                resHandler.resExitChatRoom(session, ErrorExitChatRoom.AUTH_REQUIRED);
                return;
            }

            var existsRoom = chatRoomService.findRoomById(roomId);

            if (existsRoom.isEmpty()) {
                resHandler.resExitChatRoom(session, ErrorExitChatRoom.NO_EXISTS_ROOM);
                return;
            }

            if (!existsRoom.get().getUsers().containsKey(connectedUser.get().getId())) {
                resHandler.resExitChatRoom(session, ErrorExitChatRoom.NOT_IN_ROOM);
                return;
            }

            connectedUser.ifPresent(old -> old.setCurrentChatRoom(Optional.empty()));
            resHandler.resExitChatRoom(session, ErrorExitChatRoom.NONE);

            //messageService.notifyBrowserUserInRoom(existsRoom.get(), "채팅방 퇴장", "'" + connectedUser.get().getNickName() + "'님이 대화방에 퇴장했습니다.");
            lineNotifyService.Notify("채팅방 퇴장 (roomName:" + existsRoom.get().getRoomName() + ", nickName:" + connectedUser.get().getNickName() + ", ip: " + Helpers.getSessionIP(session) + ")");
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onTalkChatRoom(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            if (connectedUser.isEmpty() || connectedUser.get().getId().isEmpty()) {
                resHandler.resTalkChatRoom(session, ErrorTalkChatRoom.AUTH_REQUIRED);
                return;
            }

            var chatOptType = ChatType.getType(packet[1]);
            if (chatOptType.isEmpty()) {
                resHandler.resTalkChatRoom(session, ErrorTalkChatRoom.NOT_AVAILABLE_CHAT_TYPE);
                return;
            }

            var chatType = chatOptType.get();

            var offsetChatType = 2;
            var offsetChatId = offsetChatType + 16;
            var offsetRoomId = offsetChatId + 16;
            var offsetChatMessageLength = offsetRoomId + 4;

            var bytesChatId = Arrays.copyOfRange(packet, offsetChatType, offsetChatId);
            var chatId = Helpers.getUUIDFromByteArray(bytesChatId);

            var bytesRoomId = Arrays.copyOfRange(packet, offsetChatId, offsetRoomId);
            var roomId = Helpers.getUUIDFromByteArray(bytesRoomId);
            var existsRoom = chatRoomService.findRoomById(roomId);

            if (existsRoom.isEmpty()) {
                resHandler.resTalkChatRoom(session, ErrorTalkChatRoom.NO_EXISTS_ROOM);
                return;
            }

            var optUserRoom = existsRoom.get().getUserRoom(connectedUser.get());

            if (optUserRoom.isEmpty()) {
                resHandler.resTalkChatRoom(session, ErrorTalkChatRoom.NOT_IN_ROOM);
                return;
            }

            var bytesChatMessageLength = Arrays.copyOfRange(packet, offsetRoomId, offsetChatMessageLength);
            var chatMessageLength = Helpers.getIntFromByteArray(bytesChatMessageLength);
            var bytesChatMessage = Arrays.copyOfRange(packet, offsetChatMessageLength, offsetChatMessageLength + chatMessageLength);
            var chatMessage = new String(bytesChatMessage);
            var sendAt = new Date();
            var chat = new Chat(chatId, roomId, connectedUser.get().getId(), chatType, chatMessage, sendAt);
            if (isDevelopment && ChatType.IMAGE != chatType)
                logger.info(chatType + ", " + roomId + ", " + connectedUser.get().getId() + ", " + connectedUser.get().getNickName() + ", " + chatMessage + ", " + sendAt + ", " + chatId);

            // 비공개 채팅방 개설(준비중 상태) 후 첫 채팅 시작할 때
            // 공개범위를 PREPARED에서 PRIVATE로 전환하여 저장하고
            // 참여 인원에게 채팅방 정보 전송
            if (existsRoom.get().getChats().isEmpty() && existsRoom.get().getOpenType().equals(RoomOpenType.PREPARED)) {
                chatRoomService.startPreparedChatRoom(existsRoom.get());
                resHandler.resAddChatRoom(session, existsRoom.get());
                resHandler.resOpenPreparedChatRoom(session, existsRoom.get());
                resHandler.resNotificationStartChat(connectedUser.get(), existsRoom.get());
            }

            resHandler.noticeTalkChatRoom(existsRoom.get(), chat);
            messageService.notifyBrowserSendMessage(existsRoom.get(), connectedUser.get(), chatMessage);
            chatRoomService.addChatToRoom(chat);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void onHistoryChatRoom(WebSocketSession session, Optional<User> connectedUser, byte[] packet) {
        try {
            if (connectedUser.isEmpty() || connectedUser.get().getId().isEmpty()) {
                resHandler.resEnterChatRoom(session, ErrorEnterChatRoom.AUTH_REQUIRED);
                return;
            }

            var bytesRoomId = Arrays.copyOfRange(packet, 1, 17);
            var roomId = Helpers.getUUIDFromByteArray(bytesRoomId);

            var result = chatRoomService.getRoomWithHistory(roomId, connectedUser.get());
            if (!result.getLeft().equals(ErrorHistoryChatRoom.NONE) || result.getRight().isEmpty()) {
                return;
            }

            resHandler.resHistoryChatRoom(session, result.getRight().get());
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }
}
