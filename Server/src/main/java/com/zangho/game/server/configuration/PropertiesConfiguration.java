package com.zangho.game.server.configuration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.env.PropertiesPropertySourceLoader;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.core.env.MutablePropertySources;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;

@Configuration
@EnableConfigurationProperties
public class PropertiesConfiguration {

    private final Logger logger = LoggerFactory.getLogger(PropertiesConfiguration.class);

    public void loadExternalPropertySource(final MutablePropertySources propertySources, String name) {
        var sourceLoader = new PropertiesPropertySourceLoader();
        var fileResource = new FileSystemResource(String.format("./properties/%s.properties", name));
        try {
            propertySources.addLast(sourceLoader.load(name, fileResource).get(0));
        } catch (Exception e) {
            logger.error("Can't load external properties. : " + e.getMessage());
            loadInnerPropertySource(propertySources, name);
        }
    }

    public void loadInnerPropertySource(final MutablePropertySources propertySources, String name) {
        String propertiesName = (!"default".equals(name)) ? String.format("properties/%s.properties", name) : "application.properties";
        var sourceLoader = new PropertiesPropertySourceLoader();
        var classPathResource = new ClassPathResource(propertiesName);

        try {
            propertySources.addLast(sourceLoader.load(name, classPathResource).get(0));
        } catch (Exception e) {
            logger.error("Can't load internal properties. : ", e);
        }
    }

    @Bean
    public PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
        PropertySourcesPlaceholderConfigurer configurer = new PropertySourcesPlaceholderConfigurer();
        MutablePropertySources propertySources = new MutablePropertySources();

        loadInnerPropertySource(propertySources, "default");
        loadExternalPropertySource(propertySources, "server");
        loadExternalPropertySource(propertySources, "linenotify");
        loadExternalPropertySource(propertySources, "database");

        configurer.setPropertySources(propertySources);
        configurer.setIgnoreResourceNotFound(true);
        return configurer;
    }

}
