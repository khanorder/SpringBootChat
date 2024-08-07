package com.zangho.game.server.configuration;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.mvc.WebContentInterceptor;

import java.io.File;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Configuration
public class WebConfiguration implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins();
        WebMvcConfigurer.super.addCorsMappings(registry);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        CacheControl cacheControl = CacheControl.maxAge(Duration.ofMinutes(1));

        var webContentInterceptor = new WebContentInterceptor();
        webContentInterceptor.addCacheMapping(cacheControl, "/images/**");
        registry.addInterceptor(webContentInterceptor);

        WebMvcConfigurer.super.addInterceptors(registry);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        var currentPath = System.getProperty("user.dir");
        var resourcePath = Paths.get(currentPath, "resources");
        System.out.println(resourcePath);
        registry.addResourceHandler("/**")
            .addResourceLocations("file:" + resourcePath.toString() + File.separator)
            .setCachePeriod(30);

        WebMvcConfigurer.super.addResourceHandlers(registry);
    }
}
