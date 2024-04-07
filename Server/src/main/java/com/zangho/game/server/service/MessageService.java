package com.zangho.game.server.service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.Security;
import java.util.HashMap;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zangho.game.server.domain.chat.ChatRoom;
import com.zangho.game.server.error.ErrorSubscribeChatRoom;
import com.zangho.game.server.repository.chat.UserRoomRepository;
import com.zangho.game.server.repository.user.UserRepository;
import lombok.Getter;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.jose4j.lang.JoseException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;

public class MessageService {

    @Getter
    @Value("${vapid.public.key}")
    private String publicKey;
    @Getter
    @Value("${vapid.private.key}")
    private String privateKey;

    private Logger logger = LoggerFactory.getLogger(MessageService.class);
    private PushService pushService;
    private final ChatRoomService chatRoomService;
    private final UserRoomRepository userRoomRepository;
    public MessageService(ChatRoomService chatRoomService, UserRoomRepository userRoomRepository) {
        this.chatRoomService = chatRoomService;
        this.userRoomRepository = userRoomRepository;
    }

    @PostConstruct
    private void init() throws GeneralSecurityException {
        Security.addProvider(new BouncyCastleProvider());
        pushService = new PushService(publicKey, privateKey);
    }

    public void subscribe(Subscription subscription) {
        logger.info("Subscribed to " + subscription.endpoint);
//        this.subscriptions.add(subscription);
    }

    public ErrorSubscribeChatRoom subscribeChatRoom(Subscription subscription, String roomId, String userId) throws Exception {

        if (roomId.isEmpty())
            return ErrorSubscribeChatRoom.REQUIRED_ROOM_ID;

        if (userId.isEmpty())
            return ErrorSubscribeChatRoom.REQUIRED_USER_ID;

        var chatRoom = chatRoomService.findRoomById(roomId);
        if (chatRoom.isEmpty())
            return ErrorSubscribeChatRoom.NOT_FOUND_CHAT_ROOM;

        if (chatRoom.get().getUsers().isEmpty())
            return ErrorSubscribeChatRoom.EMPTY_USER_IN_ROOM;

        var userRoom = chatRoom.get().getUsers().get(userId);

        if (null == userRoom)
            return ErrorSubscribeChatRoom.NOT_FOUND_USER_IN_ROOM;

        if (null != userRoom.getSubscription())
            return ErrorSubscribeChatRoom.ALREADY_SUBSCRIBE_ROOM;

        userRoom.setSubscription(subscription);
        userRoomRepository.save(userRoom);
        return ErrorSubscribeChatRoom.NONE;
    }

    public void unsubscribe(String endpoint) {
        logger.info("Unsubscribed from " + endpoint);
//        subscriptions = subscriptions.stream().filter(s -> !endpoint.equals(s.endpoint)).collect(Collectors.toList());
    }

    public void unsubscribeChatRoom(String endpoint) {
        logger.info("Unsubscribed from " + endpoint);
//        subscriptions = subscriptions.stream().filter(s -> !endpoint.equals(s.endpoint)).collect(Collectors.toList());
    }

    public void sendNotification(Subscription subscription, String title, String body) {
        try {
            var result = new HashMap<String, Object>();
            result.put("title", title);
            result.put("body", body);
            sendNotificationJson(subscription, (new ObjectMapper()).writeValueAsString(result));
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void sendNotificationJson(Subscription subscription, String messageJson) {
        try {
            pushService.send(new Notification(subscription, messageJson));
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }

    public void notifyBrowserUserInRoom(ChatRoom chatRoom, String title, String body) {
        chatRoom.getUsers().values().forEach(userInRoom -> {
            if (null == userInRoom.getSubscription())
                return;

            sendNotification(userInRoom.getSubscription(), title, body);
        });
    }
}