package com.zangho.game.server.service;

import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;

import java.io.BufferedWriter;
import java.io.OutputStreamWriter;
import java.net.URL;
import java.net.HttpURLConnection;
import java.nio.charset.StandardCharsets;

@Data
@Service
@PropertySource("classpath:linenotify.properties")
public class LineNotifyService {
    @Value("${line.client.id}")
    private String clientId;
    @Value("${line.secret.id}")
    private String secretId;
    @Value("${line.access.token.me}")
    private String accessTokenMe;

    private final String authAPIURL;
    private final String tokenAPIURL;
    private final String notifyAPIURL;

    private final Logger logger = LoggerFactory.getLogger(LineNotifyService.class);

    public LineNotifyService() {
        authAPIURL = "https://notify-bot.line.me/oauth/authorize";
        tokenAPIURL = "https://notify-bot.line.me/oauth/token";
        notifyAPIURL = "https://notify-api.line.me/api/notify";
    }

    public boolean Notify(String message, String accessToken) {
        if (accessToken.isEmpty())
            accessToken = accessTokenMe;

        if (clientId.isEmpty() || secretId.isEmpty() || accessToken.isEmpty())
            return false;

        var config = System.getProperty("Config");
        if (null == config || !config.equals("production")) {
            logger.info(message);
            return false;
        }

        try {
            var url = new URL(notifyAPIURL);
            var connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.addRequestProperty("Authorization", "Bearer " + accessToken);
            connection.addRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            connection.setConnectTimeout(15 * 1000);
            connection.setDoInput(true);
            connection.setUseCaches(false);
            connection.setDoOutput(true);
            connection.connect();
            var outputStream = connection.getOutputStream();
            var writer = new BufferedWriter(new OutputStreamWriter(outputStream, StandardCharsets.UTF_8));
            writer.write("message=" + message);
            writer.flush();
            writer.close();
            outputStream.close();
            var statusCode = connection.getResponseCode();

            if (200 != statusCode) {
                logger.error("Error(" + statusCode + "): " + connection.getResponseMessage());
                return false;
            }
            connection.disconnect();
            return true;
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return false;
        }
    }

    public boolean Notify(String message) {
        return Notify(message, "");
    }
}
