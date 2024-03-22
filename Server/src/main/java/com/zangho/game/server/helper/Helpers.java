package com.zangho.game.server.helper;

import org.springframework.web.socket.WebSocketSession;

import java.util.Arrays;

public class Helpers {

    public static byte[] getByteArrayFromInt(int value) {
        byte[] byteArray = new byte[4];
        byteArray[0] = (byte)(value >> 24);
        byteArray[1] = (byte)(value >> 16);
        byteArray[2] = (byte)(value >> 8);
        byteArray[3] = (byte)(value);
        return byteArray;
    }

    public static int getIntFromByteArray(byte[] bytes) {
        return (
            (((int)bytes[0] & 0xff) << 24) |
            (((int)bytes[1] & 0xff) << 16) |
            (((int)bytes[2] & 0xff) << 8) |
            (((int)bytes[3] & 0xff))
        );
    }

    public static String getHexFromLong(long value) {
        var hex = new StringBuilder();
        byte[] byteArray = getByteArrayFromLong(value);
        for (byte b : byteArray) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }

    public static byte[] getByteArrayFromLong(long value) {
        byte[] byteArray = new byte[8];
        byteArray[0] = (byte)(value >> 56);
        byteArray[1] = (byte)(value >> 48);
        byteArray[2] = (byte)(value >> 40);
        byteArray[3] = (byte)(value >> 32);
        byteArray[4] = (byte)(value >> 24);
        byteArray[5] = (byte)(value >> 16);
        byteArray[6] = (byte)(value >> 8);
        byteArray[7] = (byte)(value);
        return byteArray;
    }

    public static long getLongFromByteArray(byte[] bytes) {
        return (
            (((long)bytes[0] & 0xff) << 56) |
            (((long)bytes[1] & 0xff) << 48) |
            (((long)bytes[2] & 0xff) << 40) |
            (((long)bytes[3] & 0xff) << 32) |
            (((long)bytes[4] & 0xff) << 24) |
            (((long)bytes[5] & 0xff) << 16) |
            (((long)bytes[6] & 0xff) << 8) |
            (((long)bytes[7] & 0xff))
        );
    }

    public static byte[] getByteArrayFromHex(String hex) {
        if (0 != hex.length() % 2)
            return new byte[0];

        var bytes = new byte[hex.length() / 2];
        for (int i = 0; i < hex.length(); i += 2)
            bytes[i / 2] = (byte)((Character.digit(hex.charAt(i), 16) << 4) + Character.digit(hex.charAt(i+1), 16));

        return bytes;
    }

    public static byte[] getByteArrayFromUUID(String uuid) {
        if (36 != uuid.length())
            return new byte[0];

        var hex = uuid.replace("-", "");
        if (32 != hex.length())
            return new byte[0];

        return getByteArrayFromHex(hex);
    }

    public static String getHexFromByteArray(byte[] bytes) {
        if (1 > bytes.length)
            return "";

        var hexArray = "0123456789ABCDEF".toCharArray();
        var hexChars = new char[bytes.length * 2];
        for (int i = 0; i < bytes.length; i++) {
            int v = bytes[i] & 0xFF;
            hexChars[i * 2] = hexArray[v >>> 4];
            hexChars[i * 2 + 1] = hexArray[v & 0x0F];
        }

        return new String(hexChars);
    }

    public static String getUUIDFromByteArray(byte[] bytes) {
        if (16 != bytes.length)
            return "";

        var hex = getHexFromByteArray(bytes);
        if (32 != hex.length())
            return "";

        StringBuilder uuid = new StringBuilder();
        for (var i = 0; i < hex.length(); i += 2)
            uuid.append(Arrays.asList(8, 12, 16, 20).contains(i) ? "-" : "").append(hex, i, i + 2);

        return uuid.toString().toLowerCase();
    }

    public static String getSessionIP(WebSocketSession session) {
        var headers = session.getHandshakeHeaders().get("X-Forwarded-For");
        if (null == headers || headers.isEmpty()) {
            return null == session.getRemoteAddress() ? "" : session.getRemoteAddress().toString();
        } else {
            return headers.get(0);
        }
    }

}
