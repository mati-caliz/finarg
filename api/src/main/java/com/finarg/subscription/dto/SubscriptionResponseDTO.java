package com.finarg.subscription.dto;

import com.finarg.subscription.model.BillingPeriod;
import com.finarg.subscription.model.SubscriptionPlan;
import com.finarg.subscription.model.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponseDTO {
    private Long id;
    private SubscriptionPlan plan;
    private SubscriptionStatus status;
    private BillingPeriod billingPeriod;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime cancelledAt;
    private Integer priceAtPurchase;
    private PlanFeaturesDTO features;
    private UsageLimitsDTO currentUsage;
}
