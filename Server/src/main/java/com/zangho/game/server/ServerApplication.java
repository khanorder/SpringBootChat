package com.zangho.game.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@EnableScheduling
@SpringBootApplication
public class ServerApplication {

	public static void main(String[] args)
	{
		TimeZone.setDefault( TimeZone.getTimeZone("UTC"));
		SpringApplication.run(ServerApplication.class, args);
	}

}
