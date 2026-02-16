package com.finarg.payment.client;

import com.finarg.payment.dto.MobbexSubscriberRequestDTO;
import com.finarg.payment.dto.MobbexSubscriberResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
@Slf4j
public class MobbexClient {

    @Qualifier("mobbexWebClient")
    private final WebClient mobbexWebClient;

    @Value("${mobbex.subscription-plan-id}")
    private String subscriptionPlanId;

    public MobbexSubscriberResponseDTO createSubscriber(MobbexSubscriberRequestDTO request) {
        String endpoint = String.format("/subscriptions/%s/subscriber", subscriptionPlanId);

        try {
            log.debug("Creating Mobbex subscriber: {}", request.getCustomer().getEmail());

            MobbexSubscriberResponseDTO response = mobbexWebClient.post()
                    .uri(endpoint)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(MobbexSubscriberResponseDTO.class)
                    .onErrorResume(error -> {
                        log.error("Error creating Mobbex subscriber: {}", error.getMessage());
                        return Mono.empty();
                    })
                    .block();

            if (response != null && response.getResult() != null && response.getResult()) {
                log.info("Successfully created Mobbex subscriber: {}",
                        response.getData() != null && response.getData().getSubscriber() != null
                        ? response.getData().getSubscriber().getUid()
                        : "unknown");
            } else {
                log.warn("Mobbex API returned unsuccessful result");
            }

            return response;
        } catch (WebClientException e) {
            log.error("Exception calling Mobbex API: {}", e.getMessage(), e);
            return null;
        }
    }

    public boolean executeCharge(String subscriberId) {
        String endpoint = String.format("/subscriptions/%s/subscriber/%s/execution",
                subscriptionPlanId, subscriberId);

        try {
            log.debug("Executing manual charge for subscriber: {}", subscriberId);

            mobbexWebClient.post()
                    .uri(endpoint)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();

            log.info("Manual charge executed for subscriber: {}", subscriberId);
            return true;
        } catch (WebClientException e) {
            log.error("Error executing charge for subscriber {}: {}", subscriberId, e.getMessage());
            return false;
        }
    }
}
