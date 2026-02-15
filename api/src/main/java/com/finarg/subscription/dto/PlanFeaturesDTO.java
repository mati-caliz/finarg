package com.finarg.subscription.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanFeaturesDTO {
    private int dailyCalculations;
    private int maxAlerts;
    private int apiRequestsPerDay;
    private boolean hasAdvancedFeatures;
    private boolean hasExportData;
    private boolean hasApiAccess;
    private boolean isUnlimitedCalculations;
    private boolean isUnlimitedAlerts;
}
