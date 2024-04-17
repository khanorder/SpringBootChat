package com.zangho.game.server.repository.chat;

import com.zangho.game.server.domain.chat.ChatImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatImageRepository extends JpaRepository<ChatImage, String> {

    @Override
    <S extends ChatImage> S save(S entity);

    Optional<ChatImage> findByChatId(String chatId);

    @Override
    long count();
}
