package com.finarg.payment.controller;

import com.finarg.payment.dto.MobbexWebhookRequestDTO;
import com.finarg.payment.service.MobbexWebhookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/webhooks/mobbex")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Webhooks", description = "Payment webhook endpoints")
public class MobbexWebhookController {

    private final MobbexWebhookService mobbexWebhookService;

    @PostMapping
    @Operation(summary = "Handle Mobbex payment webhook")
    public ResponseEntity<Void> handleWebhook(@Valid @RequestBody MobbexWebhookRequestDTO webhook) {
        log.info("Received Mobbex webhook: type={}, id={}", webhook.getType(), webhook.getId());

        try {
            mobbexWebhookService.processWebhook(webhook);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error processing webhook {}: {}", webhook.getId(), e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }
}
