package com.zangho.game.server.domain.user;

import java.util.Date;

public interface UserInterface {
    String getId();
    String getName();
    String getMessage();
    Date getLatestActiveAt();
    // JPA Native Query 실행 시 boolean 값이 int로 반환됨
    int getHaveProfile();
}
