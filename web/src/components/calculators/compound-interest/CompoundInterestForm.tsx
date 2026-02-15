"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import type { CompoundInterestRequest } from "@/types";
import { Calculator, DollarSign, Loader2, Percent } from "lucide-react";
import { useState } from "react";

interface CompoundInterestFormProps {
  onSubmit: (data: CompoundInterestRequest) => void;
  isPending: boolean;
}

export function CompoundInterestForm({ onSubmit, isPending }: CompoundInterestFormProps) {
  const { translate } = useTranslation();
  const [formData, setFormData] = useState<CompoundInterestRequest>({
    initialCapital: 0,
    annualRate: 8,
    years: 5,
    compoundingFrequency: "MONTHLY",
    periodicContribution: 0,
  });

  const handleInputChange = (
    field: keyof CompoundInterestRequest,
    value: CompoundInterestRequest[keyof CompoundInterestRequest],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-primary" />
          {translate("investmentData")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="initialCapital"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {translate("initialCapital")}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="initialCapital"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={formData.initialCapital || ""}
                  onChange={(e) =>
                    handleInputChange("initialCapital", Number.parseFloat(e.target.value) || 0)
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="annualRate"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {translate("annualInterestRate")}
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="annualRate"
                  type="number"
                  min="0"
                  max="200"
                  step="0.1"
                  placeholder="8"
                  value={formData.annualRate || ""}
                  onChange={(e) =>
                    handleInputChange("annualRate", Number.parseFloat(e.target.value) || 0)
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="years" className="block text-sm font-medium text-foreground mb-2">
                {translate("investmentPeriod")} ({translate("years")})
              </label>
              <Input
                id="years"
                type="number"
                min="1"
                max="50"
                placeholder="5"
                value={formData.years || ""}
                onChange={(e) => handleInputChange("years", Number.parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <p className="block text-sm font-medium text-foreground mb-2">
                {translate("compoundingFrequency")}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={formData.compoundingFrequency === "MONTHLY" ? "default" : "outline"}
                  onClick={() => handleInputChange("compoundingFrequency", "MONTHLY")}
                >
                  {translate("monthly")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={formData.compoundingFrequency === "QUARTERLY" ? "default" : "outline"}
                  onClick={() => handleInputChange("compoundingFrequency", "QUARTERLY")}
                >
                  {translate("quarterly")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={formData.compoundingFrequency === "YEARLY" ? "default" : "outline"}
                  onClick={() => handleInputChange("compoundingFrequency", "YEARLY")}
                >
                  {translate("yearly")}
                </Button>
              </div>
            </div>

            <div>
              <label
                htmlFor="periodicContribution"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {translate("periodicContribution")} ({translate("optional")})
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="periodicContribution"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={formData.periodicContribution || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "periodicContribution",
                      Number.parseFloat(e.target.value) || 0,
                    )
                  }
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {translate("periodicContributionNote")}
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || formData.initialCapital <= 0}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {translate("calculating")}
              </>
            ) : (
              translate("calculate")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
