package com.zangho.game.server;

import com.zangho.game.server.helper.Helpers;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@EnableScheduling
@SpringBootApplication
public class ServerApplication {

	private static ApplicationContext applicationContext;

	public static void main(String[] args)
	{
		TimeZone.setDefault( TimeZone.getTimeZone("UTC"));
		applicationContext = SpringApplication.run(ServerApplication.class, args);
	}

}
