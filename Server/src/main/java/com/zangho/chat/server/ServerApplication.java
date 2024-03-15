package com.zangho.chat.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Date;
import java.util.TimeZone;

@SpringBootApplication
public class ServerApplication {

	public static void main(String[] args)
	{
		TimeZone.setDefault( TimeZone.getTimeZone("UTC"));
		var now = new Date().getTime();
		System.out.println("utc: " + now);
		SpringApplication.run(ServerApplication.class, args);
	}

}
