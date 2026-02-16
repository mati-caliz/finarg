package com.finarg.payment.service;

import com.finarg.payment.client.MobbexClient;
import com.finarg.payment.dto.MobbexSubscriberRequestDTO;
import com.finarg.payment.dto.MobbexSubscriberResponseDTO;
import com.finarg.subscription.entity.Subscription;
import com.finarg.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MobbexService {

    private final MobbexClient mobbexClient;

    public String createSubscriberAndGetCheckoutUrl(User user, Subscription subscription) {
        MobbexSubscriberRequestDTO request = buildSubscriberRequest(user);

        MobbexSubscriberResponseDTO response = mobbexClient.createSubscriber(request);

        if (response == null || response.getData() == null) {
            log.error("Failed to create Mobbex subscriber for user: {}", user.getId());
            return null;
        }

        String subscriberId = response.getData().getSubscriber() != null
                ? response.getData().getSubscriber().getUid()
                : null;
        String sourceUrl = response.getData().getSourceUrl();

        if (subscriberId == null || sourceUrl == null) {
            log.error("Invalid Mobbex response for user: {}", user.getId());
            return null;
        }

        subscription.setMobbexSubscriberId(subscriberId);

        log.info("Created Mobbex subscriber {} for user {}", subscriberId, user.getId());

        return sourceUrl;
    }

    private MobbexSubscriberRequestDTO buildSubscriberRequest(User user) {
        return MobbexSubscriberRequestDTO.builder()
                .customer(MobbexSubscriberRequestDTO.CustomerDTO.builder()
                        .name(user.getName())
                        .email(user.getEmail())
                        .identification("")
                        .phone("")
                        .build())
                .build();
    }
}
