package com.finarg.subscription.model;

import lombok.Getter;

@Getter
public enum BillingPeriod {
    MONTHLY(1, 0),
    YEARLY(12, 17);

    private final int months;
    private final int discountPercentage;

    BillingPeriod(int months, int discountPercentage) {
        this.months = months;
        this.discountPercentage = discountPercentage;
    }

    public int calculatePrice(int monthlyPrice) {
        int totalPrice = monthlyPrice * months;
        return totalPrice - (totalPrice * discountPercentage / 100);
    }
}
