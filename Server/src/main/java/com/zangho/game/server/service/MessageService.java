package com.zangho.game.server.service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.Security;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

import com.zangho.game.server.error.ErrorSubscribeChatRoom;
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
    public MessageService(ChatRoomService chatRoomService) {
        this.chatRoomService = chatRoomService;
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

        var chatRoom = chatRoomService.findPublicRoomById(roomId);
        if (chatRoom.isEmpty())
            return ErrorSubscribeChatRoom.NOT_FOUND_CHAT_ROOM;

        if (chatRoom.get().getSessions().isEmpty())
            return ErrorSubscribeChatRoom.EMPTY_USER_IN_ROOM;

        var user = chatRoom.get().getSessions().values().stream().filter(userRoom -> userRoom.getUserId().equals(userId)).findAny();

        if (user.isEmpty())
            return ErrorSubscribeChatRoom.NOT_FOUND_USER_IN_ROOM;

        if (user.get().getSubscription().isPresent())
            return ErrorSubscribeChatRoom.ALREADY_SUBSCRIBE_ROOM;

        user.get().setSubscription(Optional.of(subscription));
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
        var json = """
        {
            "title":"%s",
            "body":"%s"
        }
        """;
        sendNotificationJson(subscription, String.format(json, title, body));
    }

    public void sendNotificationJson(Subscription subscription, String messageJson) {
        try {
            pushService.send(new Notification(subscription, messageJson));
        } catch (GeneralSecurityException | IOException | JoseException | ExecutionException
                 | InterruptedException e) {
            e.printStackTrace();
        }
    }

//    @Scheduled(fixedRate = 15000)
//    private void sendNotifications() {
//        logger.info("Sending notifications to all subscribers: " + subscriptions.size());
//
//        var json = """
//        {
//          "title": "Server says hello!",
//          "body": "It is now: %s"
//        }
//        """;
//
//        subscriptions.forEach(subscription -> {
//            sendNotification(subscription, String.format(json, LocalTime.now()));
//        });
//    }
}