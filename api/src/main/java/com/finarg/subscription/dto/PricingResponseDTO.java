package com.finarg.subscription.dto;

import com.finarg.subscription.model.SubscriptionPlan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingResponseDTO {
    private List<PlanPricingDTO> plans;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlanPricingDTO {
        private SubscriptionPlan plan;
        private String name;
        private String description;
        private int monthlyPrice;
        private int yearlyPrice;
        private int yearlyDiscount;
        private PlanFeaturesDTO features;
        private List<String> highlights;
        private boolean recommended;
    }
}
