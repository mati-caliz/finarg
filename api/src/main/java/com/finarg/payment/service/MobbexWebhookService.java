package com.finarg.payment.service;

import com.finarg.payment.dto.MobbexWebhookRequestDTO;
import com.finarg.payment.entity.MobbexWebhookLog;
import com.finarg.payment.repository.MobbexWebhookLogRepository;
import com.finarg.subscription.entity.Subscription;
import com.finarg.subscription.model.SubscriptionStatus;
import com.finarg.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MobbexWebhookService {

    private final MobbexWebhookLogRepository webhookLogRepository;
    private final SubscriptionRepository subscriptionRepository;

    @Transactional
    public void processWebhook(MobbexWebhookRequestDTO webhook) {
        String webhookId = webhook.getId();

        if (webhookLogRepository.existsByWebhookId(webhookId)) {
            log.info("Webhook {} already processed, skipping", webhookId);
            return;
        }

        logWebhook(webhook);

        if (!"subscription:execution".equals(webhook.getType())) {
            log.info("Ignoring webhook type: {}", webhook.getType());
            return;
        }

        processSubscriptionExecution(webhook);
    }

    private void processSubscriptionExecution(MobbexWebhookRequestDTO webhook) {
        if (webhook.getData() == null || webhook.getData().getSubscriber() == null
                || webhook.getData().getExecution() == null
                || webhook.getData().getPayment() == null
                || webhook.getData().getPayment().getStatus() == null) {
            log.error("Invalid webhook data structure for webhook {}", webhook.getId());
            return;
        }

        String subscriberId = webhook.getData().getSubscriber().getUid();
        String executionId = webhook.getData().getExecution().getUid();
        String paymentStatus = webhook.getData().getPayment().getStatus().getCode();

        Optional<Subscription> subscriptionOpt = subscriptionRepository
                .findByMobbexSubscriberId(subscriberId);

        if (subscriptionOpt.isEmpty()) {
            log.error("No subscription found for Mobbex subscriber: {}", subscriberId);
            return;
        }

        Subscription subscription = subscriptionOpt.get();

        if ("200".equals(paymentStatus) || "2".equals(paymentStatus)) {
            subscription.setStatus(SubscriptionStatus.ACTIVE);
            subscription.setMobbexExecutionId(executionId);
            subscription.setLastPaymentDate(LocalDateTime.now());
            subscription.setNextBillingDate(calculateNextBillingDate(subscription));

            log.info("Subscription {} activated after successful payment", subscription.getId());
        } else {
            log.warn("Payment failed for subscription {} with status {}",
                    subscription.getId(), paymentStatus);
            subscription.setStatus(SubscriptionStatus.PAYMENT_FAILED);
        }

        subscriptionRepository.save(subscription);
    }

    private void logWebhook(MobbexWebhookRequestDTO webhook) {
        Map<String, Object> rawPayload = new HashMap<>();
        rawPayload.put("id", webhook.getId());
        rawPayload.put("type", webhook.getType());

        if (webhook.getData() != null) {
            Map<String, Object> dataMap = new HashMap<>();

            if (webhook.getData().getSubscriber() != null) {
                dataMap.put("subscriber_uid", webhook.getData().getSubscriber().getUid());
            }
            if (webhook.getData().getExecution() != null) {
                dataMap.put("execution_uid", webhook.getData().getExecution().getUid());
            }
            if (webhook.getData().getPayment() != null
                    && webhook.getData().getPayment().getStatus() != null) {
                dataMap.put("payment_status", webhook.getData().getPayment().getStatus().getCode());
            }

            rawPayload.put("data", dataMap);
        }

        String subscriberId = webhook.getData() != null && webhook.getData().getSubscriber() != null
                ? webhook.getData().getSubscriber().getUid()
                : null;
        String executionId = webhook.getData() != null && webhook.getData().getExecution() != null
                ? webhook.getData().getExecution().getUid()
                : null;
        String status = webhook.getData() != null && webhook.getData().getPayment() != null
                && webhook.getData().getPayment().getStatus() != null
                ? webhook.getData().getPayment().getStatus().getCode()
                : null;

        MobbexWebhookLog log = MobbexWebhookLog.builder()
                .webhookId(webhook.getId())
                .eventType(webhook.getType())
                .subscriberId(subscriberId)
                .executionId(executionId)
                .status(status)
                .processedAt(LocalDateTime.now())
                .rawPayload(rawPayload)
                .build();

        webhookLogRepository.save(log);
    }

    private LocalDateTime calculateNextBillingDate(Subscription subscription) {
        LocalDateTime now = LocalDateTime.now();

        return switch (subscription.getBillingPeriod()) {
            case MONTHLY -> now.plusMonths(1);
            case YEARLY -> now.plusYears(1);
        };
    }
}
