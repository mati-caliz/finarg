package com.finarg.subscription.entity;

import com.finarg.subscription.model.BillingPeriod;
import com.finarg.subscription.model.SubscriptionPlan;
import com.finarg.subscription.model.SubscriptionStatus;
import com.finarg.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionPlan plan;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillingPeriod billingPeriod;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    private LocalDateTime cancelledAt;

    @Column(name = "mercadopago_subscription_id")
    private String mercadoPagoSubscriptionId;

    @Column(name = "stripe_subscription_id")
    private String stripeSubscriptionId;

    private Integer priceAtPurchase;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public boolean isActive() {
        return status == SubscriptionStatus.ACTIVE
               && LocalDateTime.now().isBefore(endDate);
    }

    public boolean isPremiumOrHigher() {
        return plan.isPremiumOrHigher();
    }

    public boolean hasFeature(String feature) {
        return switch (feature) {
            case "advanced_analytics" -> plan.isHasAdvancedFeatures();
            case "export_data" -> plan.isHasExportData();
            case "api_access" -> plan.isHasApiAccess();
            case "unlimited_calculations" -> plan.isUnlimitedCalculations();
            case "unlimited_alerts" -> plan.isUnlimitedAlerts();
            default -> false;
        };
    }
}
