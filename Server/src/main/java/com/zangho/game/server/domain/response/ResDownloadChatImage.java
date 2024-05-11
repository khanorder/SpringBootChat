package com.zangho.game.server.domain.response;

import com.zangho.game.server.error.ErrorDownloadChatImage;
import lombok.Data;

@Data
public class ResDownloadChatImage {
    private ErrorDownloadChatImage result;
    private String mime;
    private String fileBase64;
    private String fileName;
}
