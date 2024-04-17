package com.zangho.game.server.service;

import com.zangho.game.server.define.NotificationType;
import com.zangho.game.server.domain.chat.ChatRoom;
import com.zangho.game.server.domain.user.Notification;
import com.zangho.game.server.domain.user.User;
import com.zangho.game.server.repository.user.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import java.util.List;
import java.util.Optional;

public class NotificationService {

    private final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Optional<Notification> findById(String id) {
        return notificationRepository.findById(id);
    }

    public List<Notification> findLatestByUserId(String userId) {
        return notificationRepository.findTop50ByUserIdOrderBySendAtDesc(userId);
    }

    public Optional<Notification> createNotificationFollow(User follower, User follow) {
        try {
            var notification = new Notification(NotificationType.FOLLOWER, follow.getId(), new Date());
            notification.setTargetId(follower.getId());
            return Optional.ofNullable(notificationRepository.save(notification));
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return Optional.empty();
        }
    }

    public Optional<Notification> createNotificationStartChat(ChatRoom chatRoom, String startUserId, String targetUserId) {
        try {
            var notification = new Notification(NotificationType.START_CHAT, targetUserId, new Date());
            notification.setTargetId(startUserId);
            notification.setUrl(chatRoom.getRoomId());
            return Optional.ofNullable(notificationRepository.save(notification));
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return Optional.empty();
        }
    }

    public Optional<Notification> createNotificationAddUserChatRoom(ChatRoom chatRoom, String sendUserId, String targetUserId) {
        try {
            var notification = new Notification(NotificationType.ADD_USER_CHAT_ROOM, targetUserId, new Date());
            notification.setTargetId(sendUserId);
            notification.setUrl(chatRoom.getRoomId());
            return Optional.ofNullable(notificationRepository.save(notification));
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return Optional.empty();
        }
    }

    public Optional<Notification> check(Notification notification) {
        notification.setCheck(true);
        return Optional.ofNullable(notificationRepository.save(notification));
    }

    public boolean remove(Notification notification) {
        notification.setCheck(true);
        notificationRepository.deleteById(notification.getId());
        return !notificationRepository.existsById(notification.getId());
    }

}
