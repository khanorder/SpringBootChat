package com.zangho.game.server.scheduler;

import com.zangho.game.server.service.ChatRoomService;
import com.zangho.game.server.socketHandler.chat.SocketHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class TestScheduler {
    private final Logger logger = LoggerFactory.getLogger(TestScheduler.class);
    private final SocketHandler socketHandler;
    private final ChatRoomService chatRoomService;
    public TestScheduler(SocketHandler socketHandler, ChatRoomService chatRoomService) {
        this.socketHandler = socketHandler;
        this.chatRoomService = chatRoomService;
    }

//    @Scheduled(fixedDelay = 3000)
    public void run() throws Exception {
        try {
//            var chatRooms = chatService.findAllRoom();
//            if (!chatRooms.isEmpty()) {
//                for (ChatRoom chatRoom : chatRooms) {
//                    if (chatRoom.getSessions().isEmpty())
//                        continue;
//
//                    var packet = chatSocketHandler.mergeBytePacket(new byte[] { PacketType.TEST.getByte() }, Helpers.getByteArrayFromUUID(UUID.randomUUID().toString()));
//                    chatSocketHandler.sendToEachSession(chatRoom.getSessions().keySet(), packet);
//                    logger.info("roomId: " + chatRoom.getRoomId() + ", roomName: " + chatRoom.getRoomName());
//                }
//            }
//            var packet = chatSocketHandler.mergeBytePacket(new byte[] { PacketType.TEST.getByte() }, Helpers.getByteArrayFromUUID(UUID.randomUUID().toString()));
//            chatSocketHandler.sendToAll(packet);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
        }
    }
}
