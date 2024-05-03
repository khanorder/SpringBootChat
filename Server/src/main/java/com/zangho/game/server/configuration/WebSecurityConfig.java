package com.zangho.game.server.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zangho.game.server.security.filter.JwtAuthenticationFilter;
import com.zangho.game.server.security.handler.ChatAccessDeniedHandler;
import com.zangho.game.server.security.handler.ChatAuthenticationEntryPoint;
import com.zangho.game.server.service.JwtService;
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
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import java.util.List;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    private final Logger logger = LoggerFactory.getLogger(WebSecurityConfig.class);

    private final JwtService jwtService;

    @Value("${server.cors.allowed_origins:}")
    private List<String> allowedOrigins;

    public WebSecurityConfig(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable);
        http.httpBasic(AbstractHttpConfigurer::disable);
        http.formLogin(AbstractHttpConfigurer::disable);

        http.sessionManagement(httpSecuritySessionManagementConfigurer -> {
            httpSecuritySessionManagementConfigurer.sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        });

        http.exceptionHandling(httpSecurityExceptionHandlingConfigurer -> {
            httpSecurityExceptionHandlingConfigurer.authenticationEntryPoint(chatAuthenticationEntryPoint());
            httpSecurityExceptionHandlingConfigurer.accessDeniedHandler(chatAccessDeniedHandler());
        });

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

        http.authorizeHttpRequests((authorizationManagerRequestMatcherRegistry -> {
            authorizationManagerRequestMatcherRegistry.requestMatchers("/favicon.ico").permitAll();
            authorizationManagerRequestMatcherRegistry.requestMatchers("/auth/signIn").permitAll();
            authorizationManagerRequestMatcherRegistry.requestMatchers("/auth/signUp").permitAll();
            authorizationManagerRequestMatcherRegistry.requestMatchers("/tracking/visit").permitAll();
            authorizationManagerRequestMatcherRegistry.requestMatchers("/images/**").permitAll();
            authorizationManagerRequestMatcherRegistry.requestMatchers("/ws/game").permitAll();
            authorizationManagerRequestMatcherRegistry.requestMatchers("/notify/**").hasRole("USER");
            authorizationManagerRequestMatcherRegistry.requestMatchers("/api/**").hasRole("USER");
            authorizationManagerRequestMatcherRegistry.anyRequest().authenticated();
        }));

        http.addFilterBefore(new JwtAuthenticationFilter(jwtService), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public ChatAuthenticationEntryPoint chatAuthenticationEntryPoint() {
        return new ChatAuthenticationEntryPoint();
    }

    @Bean
    public ChatAccessDeniedHandler chatAccessDeniedHandler() {
        return new ChatAccessDeniedHandler();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

}
