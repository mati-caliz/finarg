package com.finarg.subscription.service;

import com.finarg.payment.service.MobbexService;
import com.finarg.subscription.dto.CheckoutURLDTO;
import com.finarg.subscription.dto.CreateSubscriptionRequestDTO;
import com.finarg.subscription.dto.PlanFeaturesDTO;
import com.finarg.subscription.dto.PricingResponseDTO;
import com.finarg.subscription.dto.SubscriptionResponseDTO;
import com.finarg.subscription.dto.UsageLimitsDTO;
import com.finarg.subscription.entity.Subscription;
import com.finarg.subscription.entity.UsageTracking;
import com.finarg.subscription.model.BillingPeriod;
import com.finarg.subscription.model.SubscriptionPlan;
import com.finarg.subscription.model.SubscriptionStatus;
import com.finarg.subscription.repository.SubscriptionRepository;
import com.finarg.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UsageTrackingService usageTrackingService;
    private final MobbexService mobbexService;

    public Subscription getActiveSubscription(User user) {
        return subscriptionRepository
                .findTopByUserAndStatusOrderByEndDateDesc(user, SubscriptionStatus.ACTIVE)
                .filter(Subscription::isActive)
                .orElse(createFreeSubscription(user));
    }

    private Subscription createFreeSubscription(User user) {
        return Subscription.builder()
                .user(user)
                .plan(SubscriptionPlan.FREE)
                .status(SubscriptionStatus.ACTIVE)
                .billingPeriod(BillingPeriod.MONTHLY)
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusYears(100))
                .priceAtPurchase(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Transactional
    public CheckoutURLDTO createSubscription(User user, CreateSubscriptionRequestDTO request) {
        Subscription currentSub = getActiveSubscription(user);
        if (currentSub.getId() != null && currentSub.getStatus() == SubscriptionStatus.ACTIVE) {
            currentSub.setStatus(SubscriptionStatus.CANCELLED);
            currentSub.setCancelledAt(LocalDateTime.now());
            subscriptionRepository.save(currentSub);
        }

        int price = request.getBillingPeriod().calculatePrice(request.getPlan().getPriceArs());
        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = startDate.plusMonths(request.getBillingPeriod().getMonths());

        Subscription subscription = Subscription.builder()
                .user(user)
                .plan(request.getPlan())
                .status(SubscriptionStatus.PENDING_PAYMENT)
                .billingPeriod(request.getBillingPeriod())
                .startDate(startDate)
                .endDate(endDate)
                .priceAtPurchase(price)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        subscription = subscriptionRepository.save(subscription);

        String checkoutUrl = mobbexService.createSubscriberAndGetCheckoutUrl(user, subscription);

        if (checkoutUrl == null) {
            subscription.setStatus(SubscriptionStatus.CANCELLED);
            subscriptionRepository.save(subscription);
            throw new RuntimeException("Failed to create Mobbex checkout");
        }

        subscriptionRepository.save(subscription);

        return CheckoutURLDTO.builder()
                .checkoutUrl(checkoutUrl)
                .subscriptionId(subscription.getId().toString())
                .build();
    }

    @Transactional
    public void cancelSubscription(User user) {
        Subscription subscription = getActiveSubscription(user);
        if (subscription.getId() != null) {
            subscription.setStatus(SubscriptionStatus.CANCELLED);
            subscription.setCancelledAt(LocalDateTime.now());
            subscriptionRepository.save(subscription);
            log.info("Cancelled subscription {} for user {}", subscription.getId(), user.getId());
        }
    }

    public SubscriptionResponseDTO getSubscriptionResponse(User user) {
        Subscription subscription = getActiveSubscription(user);
        PlanFeaturesDTO features = buildPlanFeatures(subscription.getPlan());
        UsageLimitsDTO usage = buildUsageLimits(user, subscription);

        return SubscriptionResponseDTO.builder()
                .id(subscription.getId())
                .plan(subscription.getPlan())
                .status(subscription.getStatus())
                .billingPeriod(subscription.getBillingPeriod())
                .startDate(subscription.getStartDate())
                .endDate(subscription.getEndDate())
                .cancelledAt(subscription.getCancelledAt())
                .priceAtPurchase(subscription.getPriceAtPurchase())
                .features(features)
                .currentUsage(usage)
                .build();
    }

    public PricingResponseDTO getPricing() {
        List<PricingResponseDTO.PlanPricingDTO> plans = Arrays.stream(SubscriptionPlan.values())
                .map(this::buildPlanPricing)
                .toList();

        return PricingResponseDTO.builder()
                .plans(plans)
                .build();
    }

    private PricingResponseDTO.PlanPricingDTO buildPlanPricing(SubscriptionPlan plan) {
        return PricingResponseDTO.PlanPricingDTO.builder()
                .plan(plan)
                .name(getPlanName(plan))
                .description(getPlanDescription(plan))
                .monthlyPrice(plan.getPriceArs())
                .yearlyPrice(BillingPeriod.YEARLY.calculatePrice(plan.getPriceArs()))
                .yearlyDiscount(BillingPeriod.YEARLY.getDiscountPercentage())
                .features(buildPlanFeatures(plan))
                .highlights(getPlanHighlights(plan))
                .recommended(plan == SubscriptionPlan.PREMIUM)
                .build();
    }

    private PlanFeaturesDTO buildPlanFeatures(SubscriptionPlan plan) {
        return PlanFeaturesDTO.builder()
                .dailyCalculations(plan.getDailyCalculations())
                .maxAlerts(plan.getMaxAlerts())
                .apiRequestsPerDay(plan.getApiRequestsPerDay())
                .hasAdvancedFeatures(plan.isHasAdvancedFeatures())
                .hasExportData(plan.isHasExportData())
                .hasApiAccess(plan.isHasApiAccess())
                .isUnlimitedCalculations(plan.isUnlimitedCalculations())
                .isUnlimitedAlerts(plan.isUnlimitedAlerts())
                .build();
    }

    private UsageLimitsDTO buildUsageLimits(User user, Subscription subscription) {
        SubscriptionPlan plan = subscription.getPlan();
        int calcUsed = usageTrackingService.getTodayUsage(user, UsageTracking.UsageType.CALCULATOR);
        int apiUsed = usageTrackingService.getTodayUsage(user, UsageTracking.UsageType.API_REQUEST);

        return UsageLimitsDTO.builder()
                .calculationsUsedToday(calcUsed)
                .calculationsLimit(plan.getDailyCalculations())
                .alertsUsed(0)
                .alertsLimit(plan.getMaxAlerts())
                .apiRequestsToday(apiUsed)
                .apiRequestsLimit(plan.getApiRequestsPerDay())
                .canUseCalculator(plan.isUnlimitedCalculations() || calcUsed < plan.getDailyCalculations())
                .canCreateAlert(true)
                .canMakeApiRequest(plan.isHasApiAccess() && (apiUsed < plan.getApiRequestsPerDay()))
                .build();
    }

    private String getPlanName(SubscriptionPlan plan) {
        return switch (plan) {
            case FREE -> "Gratis";
            case PREMIUM -> "Premium";
            case PROFESSIONAL -> "Profesional";
        };
    }

    private String getPlanDescription(SubscriptionPlan plan) {
        return switch (plan) {
            case FREE -> "Ideal para usuarios casuales";
            case PREMIUM -> "Perfecto para traders e inversores";
            case PROFESSIONAL -> "Para analistas y empresas";
        };
    }

    private List<String> getPlanHighlights(SubscriptionPlan plan) {
        return switch (plan) {
            case FREE -> List.of(
                    "Cotizaciones principales",
                    "Indicadores básicos",
                    "3 cálculos por día",
                    "5 alertas"
            );
            case PREMIUM -> List.of(
                    "Cálculos ilimitados",
                    "10 alertas personalizadas",
                    "Análisis avanzado",
                    "Exportar a Excel",
                    "Sin publicidad",
                    "Dashboard personalizable"
            );
            case PROFESSIONAL -> List.of(
                    "Todo lo de Premium",
                    "50 alertas",
                    "API Access (10k req/día)",
                    "Webhooks",
                    "Soporte prioritario",
                    "White-label"
            );
        };
    }

}
