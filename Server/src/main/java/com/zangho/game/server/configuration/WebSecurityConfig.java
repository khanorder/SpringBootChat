package com.zangho.game.server.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import java.util.List;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    private Logger logger = LoggerFactory.getLogger(WebSecurityConfig.class);

    @Value("${server.cors.allowed_origins:}")
    private List<String> allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(httpSecurityCorsConfigurer -> httpSecurityCorsConfigurer.configurationSource(new CorsConfigurationSource() {
            @Override
            public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                var configuration = new CorsConfiguration();

                configuration.setAllowedOrigins(allowedOrigins);
                configuration.setAllowedMethods(List.of("POST", "GET"));
                configuration.addAllowedHeader("*");
                configuration.setAllowCredentials(true);
                return configuration;
            }
        }));

        http.csrf(httpSecurityCsrfConfigurer -> {
            httpSecurityCsrfConfigurer
                .csrfTokenRequestHandler((request, response, csrfToken) -> {

                })
                .ignoringRequestMatchers("/api/**", "/images/**", "/tracking/visit")
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse());
        });

        http.authorizeHttpRequests((authorizationManagerRequestMatcherRegistry -> {
            authorizationManagerRequestMatcherRegistry.requestMatchers("/").permitAll();
            authorizationManagerRequestMatcherRegistry.requestMatchers("/auth/login").permitAll();
            authorizationManagerRequestMatcherRegistry.requestMatchers("/auth/check").permitAll();
            authorizationManagerRequestMatcherRegistry.requestMatchers("/tracking/visit").permitAll();
            authorizationManagerRequestMatcherRegistry.requestMatchers("/images/**").permitAll();
            authorizationManagerRequestMatcherRegistry.requestMatchers("/ws/game").permitAll();
            authorizationManagerRequestMatcherRegistry.requestMatchers("/api/**").hasRole("user");
            authorizationManagerRequestMatcherRegistry.anyRequest().authenticated();
        }));

        http.formLogin(httpSecurityFormLoginConfigurer -> {
            httpSecurityFormLoginConfigurer.loginPage("/auth/login");
            httpSecurityFormLoginConfigurer.loginProcessingUrl("/auth/check");
            httpSecurityFormLoginConfigurer.usernameParameter("/id");
            httpSecurityFormLoginConfigurer.passwordParameter("/pw");
            httpSecurityFormLoginConfigurer.defaultSuccessUrl("/", true);
        });

        http.logout((httpSecurityLogoutConfigurer) -> {
            httpSecurityLogoutConfigurer.deleteCookies("CHAT_SESSION_ID");
            httpSecurityLogoutConfigurer.invalidateHttpSession(true);
            httpSecurityLogoutConfigurer.logoutUrl("/auth/logout");
        });

        return http.build();
    }

}
