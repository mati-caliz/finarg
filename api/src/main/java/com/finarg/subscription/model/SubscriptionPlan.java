package com.finarg.subscription.model;

import lombok.Getter;

@Getter
public enum SubscriptionPlan {
    FREE(0, 3, 5, 100, false, false, false),
    PREMIUM(1990, -1, 10, 1000, true, true, false),
    PROFESSIONAL(4990, -1, 50, 10000, true, true, true);

    private final int priceArs;
    private final int dailyCalculations;
    private final int maxAlerts;
    private final int apiRequestsPerDay;
    private final boolean hasAdvancedFeatures;
    private final boolean hasExportData;
    private final boolean hasApiAccess;

    SubscriptionPlan(int priceArs, int dailyCalculations, int maxAlerts,
                     int apiRequestsPerDay, boolean hasAdvancedFeatures,
                     boolean hasExportData, boolean hasApiAccess) {
        this.priceArs = priceArs;
        this.dailyCalculations = dailyCalculations;
        this.maxAlerts = maxAlerts;
        this.apiRequestsPerDay = apiRequestsPerDay;
        this.hasAdvancedFeatures = hasAdvancedFeatures;
        this.hasExportData = hasExportData;
        this.hasApiAccess = hasApiAccess;
    }

    public boolean isUnlimitedCalculations() {
        return dailyCalculations == -1;
    }

    public boolean isUnlimitedAlerts() {
        return maxAlerts == -1;
    }

    public boolean isPremiumOrHigher() {
        return this == PREMIUM || this == PROFESSIONAL;
    }

}
