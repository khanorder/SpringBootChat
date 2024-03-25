package com.zangho.game.server.repository;

import com.zangho.game.server.domain.Visit;
import com.zangho.game.server.service.VisitService;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.TimeZone;

@WebAppConfiguration
@SpringBootTest
public class VisitDatabaseTest {

    @Autowired
    private VisitService visitService;

    private Logger logger = LoggerFactory.getLogger(VisitDatabaseTest.class);

    @Test
    public void saveVisit() {
        TimeZone.setDefault( TimeZone.getTimeZone("UTC"));
        var visit = new Visit(
                "MmI7je7TDRbxuvCrQgdDc",
                5063922095L,
                "mobile",
                "samsung",
                "sm-g981b",
                "Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
                "chrome",
                "121.0.0.0",
                "webkit",
                "121.0.0.0",
                "android",
                "13",
                "chat.baejangho.com",
                "192.168.0.1",
                "",
                "/",
                1,
                "채팅 샘플",
                new Date()
            );
        var result = visitService.saveVisit(visit);
        logger.info("result: " + result);
    }
}
