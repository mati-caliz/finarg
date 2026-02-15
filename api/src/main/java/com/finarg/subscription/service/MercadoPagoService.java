package com.finarg.subscription.service;

import com.finarg.subscription.entity.Subscription;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MercadoPagoService {

    @Value("${mercadopago.access-token:}")
    private String accessToken;

    @Value("${app.base-url:http://localhost:3000}")
    private String appBaseUrl;

    public String createSubscriptionCheckout(Subscription subscription) {
        if (accessToken == null || accessToken.isEmpty()) {
            log.warn("MercadoPago access token not configured, returning mock URL");
            return appBaseUrl + "/subscription/pending?id=" + subscription.getId();
        }

        try {
            String checkoutUrl = appBaseUrl + "/subscription/success?id=" + subscription.getId();
            log.info("Created MercadoPago checkout for subscription {}: {}", subscription.getId(), checkoutUrl);
            return checkoutUrl;
        } catch (Exception e) {
            log.error("Error creating MercadoPago checkout: {}", e.getMessage());
            throw new RuntimeException("Error al crear checkout de Mercado Pago", e);
        }
    }

}
