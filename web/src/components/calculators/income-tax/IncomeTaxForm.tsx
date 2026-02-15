"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import type { IncomeTaxRequest } from "@/types";
import {
  Calculator,
  DollarSign,
  GraduationCap,
  Home,
  Loader2,
  Shield,
  UserX,
  Users,
} from "lucide-react";
import { useState } from "react";

interface IncomeTaxFormProps {
  onSubmit: (data: IncomeTaxRequest) => void;
  isPending: boolean;
}

export function IncomeTaxForm({ onSubmit, isPending }: IncomeTaxFormProps) {
  const { translate } = useTranslation();
  const [formData, setFormData] = useState<IncomeTaxRequest>({
    grossMonthlySalary: 0,
    isRetired: false,
    hasSpouse: false,
    childrenCount: 0,
    childrenWithDisabilitiesCount: 0,
    healthInsurance: undefined,
    retirement: undefined,
    union: undefined,
    unionDuesPercent: undefined,
    housingRent: undefined,
    domesticService: undefined,
    educationExpenses: undefined,
    lifeInsurance: undefined,
  });

  const handleInputChange = (
    field: keyof IncomeTaxRequest,
    value: IncomeTaxRequest[keyof IncomeTaxRequest],
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
          {translate("employeeData")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="grossMonthlySalary"
                className="block text-sm font-medium text-foreground mb-2"
              >
                {translate("grossMonthlySalary")}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="grossMonthlySalary"
                  type="number"
                  placeholder="0"
                  value={formData.grossMonthlySalary || ""}
                  onChange={(e) =>
                    handleInputChange("grossMonthlySalary", Number.parseFloat(e.target.value) || 0)
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <UserX className="h-4 w-4 text-muted-foreground" />
                  {translate("isRetired")}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={formData.isRetired ? "default" : "outline"}
                    onClick={() => handleInputChange("isRetired", true)}
                  >
                    {translate("yes")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={!formData.isRetired ? "default" : "outline"}
                    onClick={() => handleInputChange("isRetired", false)}
                  >
                    {translate("no")}
                  </Button>
                </div>
              </div>
              <div>
                <label
                  htmlFor="unionDuesPercent"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  {translate("unionDuesPercent")}
                </label>
                <div className="flex items-center gap-1">
                  <Input
                    id="unionDuesPercent"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    placeholder="0"
                    value={formData.unionDuesPercent ?? ""}
                    onChange={(e) =>
                      handleInputChange(
                        "unionDuesPercent",
                        Number.parseFloat(e.target.value) || undefined,
                      )
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Users className="h-4 w-4 text-muted-foreground" />
              {translate("familyDependents")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="block text-xs text-muted-foreground mb-1">{translate("spouse")}</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={formData.hasSpouse ? "default" : "outline"}
                    onClick={() => handleInputChange("hasSpouse", true)}
                  >
                    {translate("yes")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={!formData.hasSpouse ? "default" : "outline"}
                    onClick={() => handleInputChange("hasSpouse", false)}
                  >
                    {translate("no")}
                  </Button>
                </div>
              </div>
              <div>
                <label htmlFor="childrenCount" className="block text-xs text-muted-foreground mb-1">
                  {translate("numberOfChildren")}
                </label>
                <Input
                  id="childrenCount"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.childrenCount}
                  onChange={(e) =>
                    handleInputChange("childrenCount", Number.parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="childrenWithDisabilitiesCount"
                  className="block text-xs text-muted-foreground mb-1"
                >
                  {translate("childrenWithDisabilities")}
                </label>
                <Input
                  id="childrenWithDisabilitiesCount"
                  type="number"
                  min="0"
                  max={formData.childrenCount}
                  value={formData.childrenWithDisabilitiesCount ?? 0}
                  onChange={(e) =>
                    handleInputChange(
                      "childrenWithDisabilitiesCount",
                      Number.parseInt(e.target.value) || 0,
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Home className="h-4 w-4 text-muted-foreground" />
              {translate("optionalDeductions")}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="housingRent" className="block text-xs text-muted-foreground mb-1">
                  {translate("housingRent")}
                </label>
                <Input
                  id="housingRent"
                  type="number"
                  placeholder="0"
                  value={formData.housingRent || ""}
                  onChange={(e) =>
                    handleInputChange("housingRent", Number.parseFloat(e.target.value) || undefined)
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="domesticService"
                  className="block text-xs text-muted-foreground mb-1"
                >
                  {translate("domesticService")}
                </label>
                <Input
                  id="domesticService"
                  type="number"
                  placeholder="0"
                  value={formData.domesticService || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "domesticService",
                      Number.parseFloat(e.target.value) || undefined,
                    )
                  }
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="educationExpenses"
                className="flex items-center gap-1 text-xs text-muted-foreground mb-1"
              >
                <GraduationCap className="h-3 w-3" />
                {translate("educationalExpenses")}
              </label>
              <Input
                id="educationExpenses"
                type="number"
                placeholder="0"
                value={formData.educationExpenses ?? ""}
                onChange={(e) =>
                  handleInputChange(
                    "educationExpenses",
                    Number.parseFloat(e.target.value) || undefined,
                  )
                }
              />
            </div>
            <div>
              <label
                htmlFor="lifeInsurance"
                className="flex items-center gap-1 text-xs text-muted-foreground mb-1"
              >
                <Shield className="h-3 w-3" />
                {translate("lifeInsurance")}
              </label>
              <Input
                id="lifeInsurance"
                type="number"
                placeholder="0"
                value={formData.lifeInsurance ?? ""}
                onChange={(e) =>
                  handleInputChange("lifeInsurance", Number.parseFloat(e.target.value) || undefined)
                }
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || formData.grossMonthlySalary <= 0}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {translate("calculating")}
              </>
            ) : (
              translate("calculateTax")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
