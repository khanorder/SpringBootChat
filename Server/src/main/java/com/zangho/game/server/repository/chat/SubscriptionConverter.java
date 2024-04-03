package com.zangho.game.server.repository.chat;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import nl.martijndwars.webpush.Subscription;

public class SubscriptionConverter implements AttributeConverter<Subscription, String> {
    private static final ObjectMapper objectMapper = new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    @Override
    public String convertToDatabaseColumn(Subscription subscription) {
        try {
            return objectMapper.writeValueAsString(subscription);
        } catch (Exception ex) {
            throw new IllegalArgumentException(ex.getMessage(), ex);
        }
    }

    @Override
    public Subscription convertToEntityAttribute(String dbData) {
        try {
            return objectMapper.readValue(dbData, Subscription.class);
        } catch (Exception ex) {
            throw new IllegalArgumentException(ex.getMessage(), ex);
        }
    }
}
