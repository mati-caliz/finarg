package com.finarg.subscription.controller;

import com.finarg.subscription.dto.CheckoutURLDTO;
import com.finarg.subscription.dto.CreateSubscriptionRequestDTO;
import com.finarg.subscription.dto.PricingResponseDTO;
import com.finarg.subscription.dto.SubscriptionResponseDTO;
import com.finarg.subscription.service.SubscriptionService;
import com.finarg.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;

@RestController
@Validated
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
@Tag(name = "Subscriptions", description = "Subscription management endpoints")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/pricing")
    @Operation(summary = "Get all pricing plans")
    public ResponseEntity<PricingResponseDTO> getPricing() {
        return ResponseEntity.ok(subscriptionService.getPricing());
    }

    @GetMapping("/current")
    @Operation(summary = "Get current user subscription", security = @SecurityRequirement(name = "bearer-jwt"))
    public ResponseEntity<SubscriptionResponseDTO> getCurrentSubscription(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(subscriptionService.getSubscriptionResponse(user));
    }

    @PostMapping
    @Operation(summary = "Create new subscription", security = @SecurityRequirement(name = "bearer-jwt"))
    public ResponseEntity<CheckoutURLDTO> createSubscription(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateSubscriptionRequestDTO request) {
        CheckoutURLDTO checkoutUrl = subscriptionService.createSubscription(user, request);
        return ResponseEntity.ok(checkoutUrl);
    }

    @DeleteMapping
    @Operation(summary = "Cancel current subscription", security = @SecurityRequirement(name = "bearer-jwt"))
    public ResponseEntity<Void> cancelSubscription(@AuthenticationPrincipal User user) {
        subscriptionService.cancelSubscription(user);
        return ResponseEntity.noContent().build();
    }
}
