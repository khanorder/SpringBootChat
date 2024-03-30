package com.zangho.game.server.configuration;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.util.HashMap;

@Configuration
@EnableJpaRepositories(basePackages = "com.zangho.game.server.repository.chat", entityManagerFactoryRef = "chatEntityManager", transactionManagerRef = "chatTransactionManager")
public class PersistenceChatConfiguration {

    @Value("${rds.jpa.hibernate.ddl-auto}")
    private String ddlAuto;

    @Value("${rds.jpa.properties.hibernate.dialect}")
    private String dialect;

    @Bean(name = "chatDataSource")
    @ConfigurationProperties(prefix = "rds.chat.datasource")
    public DataSource chatDataSource() {
        return DataSourceBuilder.create().type(HikariDataSource.class).build();
    }

    @Bean
    @Primary
    public LocalContainerEntityManagerFactoryBean chatEntityManager() {
        var em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(chatDataSource());
        em.setPackagesToScan("com.zangho.game.server.domain.chat");
        em.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        var properties = new HashMap<String, Object>();

        if (!ddlAuto.isEmpty())
            properties.put("hibernate.hbm2ddl.auto", ddlAuto);

        if (!dialect.isEmpty())
            properties.put("hibernate.dialect", dialect);

        em.setJpaPropertyMap(properties);
        return em;
    }

    @Bean
    @Primary
    public PlatformTransactionManager chatTransactionManager() {
        var transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(chatEntityManager().getObject());
        return transactionManager;
    }

}
