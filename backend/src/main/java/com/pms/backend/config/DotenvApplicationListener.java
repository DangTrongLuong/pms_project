package com.pms.backend.config;

import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.stereotype.Component;

import io.github.cdimascio.dotenv.Dotenv;

@Component
public class DotenvApplicationListener implements ApplicationListener<ApplicationEnvironmentPreparedEvent> {
    
    @Override
    public void onApplicationEvent(ApplicationEnvironmentPreparedEvent event) {
        ConfigurableEnvironment environment = event.getEnvironment();
        
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory("./")
                    // .directory("/www/wwwroot/api-spring.quanliduan-pms.site")
                    .filename(".env")
                    .ignoreIfMissing()
                    .load();
            
            Map<String, Object> dotenvMap = dotenv.entries().stream()
                    .collect(Collectors.toMap(
                            entry -> entry.getKey(),
                            entry -> entry.getValue()
                    ));
            
            MapPropertySource propertySource = new MapPropertySource("dotenv", dotenvMap);
            environment.getPropertySources().addFirst(propertySource);
            
        } catch (Exception e) {
            System.err.println("Error loading .env file: " + e.getMessage());
        }
    }
}