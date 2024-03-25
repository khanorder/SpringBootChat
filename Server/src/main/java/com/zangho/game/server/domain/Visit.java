package com.zangho.game.server.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Visit {
    public String session = "";
    public long fp;
    public String deviceType = "";
    public String deviceVendor = "";
    public String deviceModel;
    public String agent;
    public String browser;
    public String browserVersion;
    public String engine;
    public String engineVersion;
    public String os;
    public String osVersion;
    public String host;
    public String ip;
    public String parameter;
    public String path;
    public int scheme;
    public String title;
    public Date localTime;
}
