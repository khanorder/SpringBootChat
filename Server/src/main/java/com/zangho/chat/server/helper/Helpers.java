package com.zangho.chat.server.helper;

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

    public int getIntFromByteArray(byte[] bytes) {
        return ((((int)bytes[0] & 0xff) << 24) | (((int)bytes[1] & 0xff) << 16) | (((int)bytes[2] & 0xff) << 8) | (((int)bytes[3] & 0xff)));
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

}
