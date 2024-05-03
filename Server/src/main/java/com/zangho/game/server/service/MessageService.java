package com.zangho.game.server.service;

import java.security.GeneralSecurityException;
import java.security.Security;
import java.util.HashMap;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zangho.game.server.domain.chat.ChatRoom;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.error.ErrorSubscribeChatRoom;
import com.zangho.game.server.error.ErrorSubscribeNotification;
import com.zangho.game.server.repository.chat.UserRoomRepository;
import lombok.Getter;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.springframework.scheduling.annotation.Async;

public class MessageService {

    @Getter
    @Value("${vapid.public.key}")
    private String publicKey;
    @Getter
    @Value("${vapid.private.key}")
    private String privateKey;

    private Logger logger = LoggerFactory.getLogger(MessageService.class);
    private PushService pushService;
    private final UserService userService;
    private final ChatRoomService chatRoomService;
    private final UserRoomRepository userRoomRepository;

    @Value("${server.hostname}")
    private String serverHostName;

    public MessageService(UserService userService, ChatRoomService chatRoomService, UserRoomRepository userRoomRepository) {
        this.userService = userService;
        this.chatRoomService = chatRoomService;
        this.userRoomRepository = userRoomRepository;
    }

    @PostConstruct
    private void init() throws GeneralSecurityException {
        Security.addProvider(new BouncyCastleProvider());
        pushService = new PushService(publicKey, privateKey);
    }

    public void unsubscribe(String endpoint) {
        logger.info("Unsubscribed from " + endpoint);
//        subscriptions = subscriptions.stream().filter(s -> !endpoint.equals(s.endpoint)).collect(Collectors.toList());
    }

    public void unsubscribeChatRoom(String endpoint) {
        logger.info("Unsubscribed from " + endpoint);
//        subscriptions = subscriptions.stream().filter(s -> !endpoint.equals(s.endpoint)).collect(Collectors.toList());
    }

    @Async
    public void sendNotificationChat(Subscription subscription, String title, String body, String path, String icon) {
        try {
            var result = new HashMap<String, Object>();
            result.put("title", title);
            result.put("body", body);
            result.put("tag", "chat");
            result.put("data", path);
            if (!icon.isEmpty())
                result.put("icon", serverHostName + icon);
            sendNotificationJson(subscription, (new ObjectMapper()).writeValueAsString(result));
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void sendNotificationWithLink(Subscription subscription, String title, String body, String path, String icon) {
        try {
            var result = new HashMap<String, Object>();
            result.put("title", title);
            result.put("body", body);
            result.put("tag", "link");
            result.put("data", path);
            if (!icon.isEmpty())
                result.put("icon", serverHostName + icon);
            sendNotificationJson(subscription, (new ObjectMapper()).writeValueAsString(result));
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void sendNotification(Subscription subscription, String title, String body, String icon) {
        try {
            var result = new HashMap<String, Object>();
            result.put("title", title);
            result.put("body", body);
            if (!icon.isEmpty())
                result.put("icon", serverHostName + icon);
            sendNotificationJson(subscription, (new ObjectMapper()).writeValueAsString(result));
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    @Async
    public void sendNotificationJson(Subscription subscription, String messageJson) {
        try {
            pushService.send(new Notification(subscription, messageJson));
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void notifyBrowserUserInRoom(ChatRoom chatRoom, String title, String body) {
        chatRoom.getUsers().values().forEach(userInRoom -> {
            var userSubscriptions = userService.findUserSubscriptionsByUserId(userInRoom.getUserId());
            if (userSubscriptions.isEmpty())
                return;

            for (var userSubscription : userSubscriptions)
                sendNotification(userSubscription.getSubscription(), title, body, "/images/profile/small/" + userInRoom.getUserId());
        });
    }

    @Async
    public void notifyBrowserSendMessage(ChatRoom chatRoom, User sendUser, String message) {
        chatRoom.getUsers().values().forEach(userInRoom -> {
            if (userInRoom.getUserId().equals(sendUser.getId()))
                return;

            var userSubscriptions = userService.findUserSubscriptionsByUserId(userInRoom.getUserId());
            if (userSubscriptions.isEmpty())
                return;

            for (var userSubscription : userSubscriptions)
                sendNotificationChat(userSubscription.getSubscription(), chatRoom.getRoomName(), sendUser.getNickName() + ": " + message, chatRoom.getRoomId(), "/images/profile/small/" + sendUser.getId());
        });
    }
}