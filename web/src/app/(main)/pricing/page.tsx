"use client";

import { subscriptionsApi } from "@/lib/api";
import type { PlanPricing } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { useState } from "react";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const { data: pricing, isLoading } = useQuery({
    queryKey: ["pricing"],
    queryFn: async () => {
      const response = await subscriptionsApi.getPricing();
      return response.data;
    },
  });

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "FREE":
        return <Sparkles className="w-8 h-8" />;
      case "PREMIUM":
        return <Crown className="w-8 h-8 text-yellow-500" />;
      case "PROFESSIONAL":
        return <Zap className="w-8 h-8 text-purple-500" />;
      default:
        return null;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "FREE":
        return "border-gray-300";
      case "PREMIUM":
        return "border-yellow-400 ring-2 ring-yellow-400";
      case "PROFESSIONAL":
        return "border-purple-500";
      default:
        return "border-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Cargando planes...</div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Elegí tu plan</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Potenciá tu análisis financiero con FinArg
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-4 p-1 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() => setBillingPeriod("monthly")}
            className={`px-6 py-2 rounded-md transition-all ${
              billingPeriod === "monthly"
                ? "bg-background shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setBillingPeriod("yearly")}
            className={`px-6 py-2 rounded-md transition-all relative ${
              billingPeriod === "yearly"
                ? "bg-background shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Anual
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8">
        {pricing?.plans.map((plan: PlanPricing) => (
          <div
            key={plan.plan}
            className={`relative rounded-2xl border-2 p-8 ${getPlanColor(plan.plan)} ${
              plan.recommended ? "shadow-xl scale-105" : "shadow-md"
            } transition-all hover:shadow-xl`}
          >
            {plan.recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Recomendado
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              {getPlanIcon(plan.plan)}
              <div>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  $
                  {billingPeriod === "monthly"
                    ? plan.monthlyPrice.toLocaleString()
                    : Math.floor(plan.yearlyPrice / 12).toLocaleString()}
                </span>
                <span className="text-muted-foreground">/mes</span>
              </div>
              {billingPeriod === "yearly" && plan.yearlyPrice > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  ${plan.yearlyPrice.toLocaleString()}/año (ahorras {plan.yearlyDiscount}%)
                </p>
              )}
            </div>

            <button
              type="button"
              className={`w-full py-3 rounded-lg font-semibold transition-all mb-6 ${
                plan.recommended
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : plan.plan === "FREE"
                    ? "bg-muted hover:bg-muted/80 text-foreground"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
            >
              {plan.plan === "FREE" ? "Plan Actual" : "Actualizar"}
            </button>

            <div className="space-y-3">
              {plan.highlights.map((highlight) => (
                <div key={highlight} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-16 text-center">
        <p className="text-muted-foreground">
          ¿Tenés dudas?{" "}
          <a href="/contacto" className="text-primary hover:underline">
            Contactanos
          </a>
        </p>
      </div>
    </div>
  );
}
