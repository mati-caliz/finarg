"use client";

import { Paywall } from "@/components/Paywall";
import { UsageBadge } from "@/components/UsageBadge";
import { FaqAccordion } from "@/components/calculators/FaqAccordion";
import { CompoundInterestForm } from "@/components/calculators/compound-interest/CompoundInterestForm";
import { CompoundInterestResults } from "@/components/calculators/compound-interest/CompoundInterestResults";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { compoundInterestApi } from "@/lib/api";
import { useAuthStore } from "@/store/useStore";
import type { CompoundInterestRequest, CompoundInterestResponse } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { Calculator } from "lucide-react";
import { useRef, useState } from "react";

const faqItems: { questionKey: TranslationKey; answerKey: TranslationKey }[] = [
  { questionKey: "faqCompoundInterestQuestion", answerKey: "faqCompoundInterestAnswer" },
  { questionKey: "faqCompoundingFrequencyQuestion", answerKey: "faqCompoundingFrequencyAnswer" },
  { questionKey: "faqPeriodicContributionQuestion", answerKey: "faqPeriodicContributionAnswer" },
  { questionKey: "faqCompoundVsSimpleQuestion", answerKey: "faqCompoundVsSimpleAnswer" },
];

export default function CompoundInterestCalculatorPage() {
  const { translate } = useTranslation();
  const { subscription } = useAuthStore();
  const [showPaywall, setShowPaywall] = useState(false);
  const [result, setResult] = useState<CompoundInterestResponse | null>(null);
  const initialCapitalRef = useRef(0);

  const calculateMutation = useMutation({
    mutationFn: async (data: CompoundInterestRequest) => {
      const response = await compoundInterestApi.calculate(data);
      return response.data as CompoundInterestResponse;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleSubmit = (data: CompoundInterestRequest) => {
    const canCalculate = subscription?.currentUsage?.canUseCalculator ?? true;

    if (!canCalculate) {
      setShowPaywall(true);
      return;
    }

    initialCapitalRef.current = data.initialCapital;
    calculateMutation.mutate(data);
  };

  return (
    <>
      {showPaywall && (
        <Paywall
          feature={translate("compoundInterestFeature")}
          description={`Has usado ${subscription?.currentUsage?.calculationsUsedToday ?? 0} de ${subscription?.currentUsage?.calculationsLimit ?? 3} cálculos hoy. Actualizá a Premium para cálculos ilimitados.`}
          onClose={() => setShowPaywall(false)}
        />
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {translate("compoundInterestTitle")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {translate("compoundInterestSubtitle")}
          </p>
        </div>

        <UsageBadge />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CompoundInterestForm onSubmit={handleSubmit} isPending={calculateMutation.isPending} />

          <div className="space-y-6">
            {result ? (
              <CompoundInterestResults result={result} initialCapital={initialCapitalRef.current} />
            ) : (
              <Card className="bg-card h-full min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center">
                  <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{translate("completeFormMessage")}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <FaqAccordion items={faqItems} />
      </div>
    </>
  );
}
