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
@EnableJpaRepositories(basePackages = "com.zangho.game.server.repository.user", entityManagerFactoryRef = "userEntityManager", transactionManagerRef = "userTransactionManager")
public class PersistenceUserConfiguration {

    @Value("${rds.jpa.hibernate.ddl-auto}")
    private String ddlAuto;

    @Value("${rds.jpa.properties.hibernate.dialect}")
    private String dialect;

    @Bean(name = "userDataSource")
    @ConfigurationProperties(prefix = "rds.user.datasource")
    public DataSource userDataSource() {
        return DataSourceBuilder.create().type(HikariDataSource.class).build();
    }

    @Bean
    @Primary
    public LocalContainerEntityManagerFactoryBean userEntityManager() {
        var em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(userDataSource());
        em.setPackagesToScan("com.zangho.game.server.domain.user");
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
    public PlatformTransactionManager userTransactionManager() {
        var transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(userEntityManager().getObject());
        return transactionManager;
    }

}
