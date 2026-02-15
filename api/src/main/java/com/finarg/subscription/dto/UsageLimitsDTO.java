package com.finarg.subscription.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsageLimitsDTO {
    private int calculationsUsedToday;
    private int calculationsLimit;
    private int alertsUsed;
    private int alertsLimit;
    private int apiRequestsToday;
    private int apiRequestsLimit;
    private boolean canUseCalculator;
    private boolean canCreateAlert;
    private boolean canMakeApiRequest;
}
