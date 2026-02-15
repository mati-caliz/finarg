package com.finarg.subscription.dto;

import com.finarg.subscription.model.BillingPeriod;
import com.finarg.subscription.model.SubscriptionPlan;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSubscriptionRequestDTO {

    @NotNull(message = "Plan is required")
    private SubscriptionPlan plan;

    @NotNull(message = "Billing period is required")
    private BillingPeriod billingPeriod;

    private String paymentMethodId;
}
