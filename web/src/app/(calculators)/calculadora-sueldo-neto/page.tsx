"use client";

import { Paywall } from "@/components/Paywall";
import { UsageBadge } from "@/components/UsageBadge";
import { FaqAccordion } from "@/components/calculators/FaqAccordion";
import { IncomeTaxForm } from "@/components/calculators/income-tax/IncomeTaxForm";
import { IncomeTaxResults } from "@/components/calculators/income-tax/IncomeTaxResults";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { incomeTaxApi } from "@/lib/api";
import { useAuthStore } from "@/store/useStore";
import type { IncomeTaxRequest, IncomeTaxResponse } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { Calculator } from "lucide-react";
import { useState } from "react";

const faqItems: { questionKey: TranslationKey; answerKey: TranslationKey }[] = [
  { questionKey: "faqNetVsGrossQuestion", answerKey: "faqNetVsGrossAnswer" },
  { questionKey: "faqWhatIsIncomeTaxQuestion", answerKey: "faqWhatIsIncomeTaxAnswer" },
  { questionKey: "faqWhatAreDeductionsQuestion", answerKey: "faqWhatAreDeductionsAnswer" },
  { questionKey: "faqValuesDisclaimerQuestion", answerKey: "faqValuesDisclaimerAnswer" },
];

export default function IncomeTaxPage() {
  const { translate } = useTranslation();
  const { subscription } = useAuthStore();
  const [showPaywall, setShowPaywall] = useState(false);
  const [result, setResult] = useState<IncomeTaxResponse | null>(null);
  const [grossMonthlySalary, setGrossMonthlySalary] = useState(0);

  const calculateMutation = useMutation({
    mutationFn: async (data: IncomeTaxRequest) => {
      const response = await incomeTaxApi.calculate(data);
      return response.data as IncomeTaxResponse;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleFormSubmit = (data: IncomeTaxRequest) => {
    const canCalculate = subscription?.currentUsage?.canUseCalculator ?? true;

    if (!canCalculate) {
      setShowPaywall(true);
      return;
    }

    setGrossMonthlySalary(data.grossMonthlySalary);
    calculateMutation.mutate(data);
  };

  return (
    <>
      {showPaywall && (
        <Paywall
          feature={translate("incomeTaxCalculatorFeature")}
          description={`Has usado ${subscription?.currentUsage?.calculationsUsedToday ?? 0} de ${subscription?.currentUsage?.calculationsLimit ?? 3} cálculos hoy. Actualizá a Premium para cálculos ilimitados.`}
          onClose={() => setShowPaywall(false)}
        />
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{translate("incomeTaxTitle")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{translate("incomeTaxSubtitle")}</p>
        </div>

        <UsageBadge />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncomeTaxForm onSubmit={handleFormSubmit} isPending={calculateMutation.isPending} />

          <div className="space-y-6">
            {result !== null ? (
              <IncomeTaxResults result={result} grossMonthlySalary={grossMonthlySalary} />
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
