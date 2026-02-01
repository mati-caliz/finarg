'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { incomeTaxApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart } from '@/components/charts';
import { IncomeTaxRequest, IncomeTaxResponse } from '@/types';
import { Calculator, DollarSign, Users, Home, GraduationCap, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function IncomeTaxPage() {
  const { translate } = useTranslation();
  const [formData, setFormData] = useState<IncomeTaxRequest>({
    grossMonthlySalary: 0,
    employeeType: 'EMPLOYEE',
    hasSpouse: false,
    childrenCount: 0,
    healthInsurance: undefined,
    retirement: undefined,
    union: undefined,
    housingRent: undefined,
    domesticService: undefined,
    educationExpenses: undefined,
  });

  const [result, setResult] = useState<IncomeTaxResponse | null>(null);

  const calculateMutation = useMutation({
    mutationFn: async (data: IncomeTaxRequest) => {
      const response = await incomeTaxApi.calculate(data);
      return response.data as IncomeTaxResponse;
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof IncomeTaxRequest, value: IncomeTaxRequest[keyof IncomeTaxRequest]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{translate('incomeTaxTitle')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {translate('incomeTaxSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              {translate('employeeData')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {translate('grossMonthlySalary')}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.grossMonthlySalary || ''}
                      onChange={(e) =>
                        handleInputChange('grossMonthlySalary', parseFloat(e.target.value) || 0)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {translate('employeeType')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={
                        formData.employeeType === 'EMPLOYEE' ? 'default' : 'outline'
                      }
                      onClick={() => handleInputChange('employeeType', 'EMPLOYEE')}
                      className="w-full"
                    >
                      {translate('employee')}
                    </Button>
                    <Button
                      type="button"
                      variant={formData.employeeType === 'SELF_EMPLOYED' ? 'default' : 'outline'}
                      onClick={() => handleInputChange('employeeType', 'SELF_EMPLOYED')}
                      className="w-full"
                    >
                      {translate('selfEmployed')}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {translate('familyDependents')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">{translate('spouse')}</label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={formData.hasSpouse ? 'default' : 'outline'}
                        onClick={() => handleInputChange('hasSpouse', true)}
                      >
                        {translate('yes')}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={!formData.hasSpouse ? 'default' : 'outline'}
                        onClick={() => handleInputChange('hasSpouse', false)}
                      >
                        {translate('no')}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">{translate('numberOfChildren')}</label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.childrenCount}
                      onChange={(e) =>
                        handleInputChange('childrenCount', parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  {translate('optionalDeductions')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">{translate('housingRent')}</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.housingRent || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'housingRent',
                          parseFloat(e.target.value) || undefined
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">{translate('domesticService')}</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.domesticService || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'domesticService',
                          parseFloat(e.target.value) || undefined
                        )
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <GraduationCap className="h-3 w-3" />
                    {translate('educationalExpenses')}
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.educationExpenses ?? ''}
                    onChange={(e) =>
                      handleInputChange('educationExpenses', parseFloat(e.target.value) || undefined)
                    }
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={calculateMutation.isPending || formData.grossMonthlySalary <= 0}
              >
                {calculateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {translate('calculating')}
                  </>
                ) : (
                  translate('calculateTax')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {result ? (
            <>
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">{translate('calculationResult')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">{translate('annualGrossSalary')}</p>
                      <p className="text-xl font-bold text-foreground">
                        {formatCurrency(result.grossAnnualSalary)}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">{translate('totalDeductions')}</p>
                      <p className="text-xl font-bold text-green-500">
                        {formatCurrency(result.totalDeductions)}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">{translate('taxableNetIncome')}</p>
                      <p className="text-xl font-bold text-foreground">
                        {formatCurrency(result.taxableNetIncome)}
                      </p>
                    </div>
                    <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                      <p className="text-xs text-muted-foreground">{translate('annualTax')}</p>
                      <p className="text-xl font-bold text-red-500">
                        {formatCurrency(result.annualTax)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-muted-foreground">{translate('monthlyTax')}</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(result.monthlyTax)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{translate('effectiveRate')}</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatPercent(result.effectiveRate)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground">{translate('monthlyNetSalary')}</p>
                      <p className="text-xl font-bold text-green-500">
                        {formatCurrency(result.monthlyNetSalary)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">{translate('deductionsDetail')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">{translate('nonTaxableMinimum')}</span>
                      <span className="text-foreground">
                        {formatCurrency(result.calculationDetails.nonTaxableMinimum)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">{translate('specialDeduction')}</span>
                      <span className="text-foreground">
                        {formatCurrency(result.calculationDetails.specialDeduction)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">{translate('familyDependents')}</span>
                      <span className="text-foreground">
                        {formatCurrency(result.calculationDetails.familyCharges)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">{translate('personalDeductions')}</span>
                      <span className="text-foreground">
                        {formatCurrency(result.calculationDetails.personalDeductions)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 font-bold">
                      <span className="text-foreground">{translate('totalAllowedDeductions')}</span>
                      <span className="text-green-500">
                        {formatCurrency(result.calculationDetails.totalAllowedDeductions)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {result.bracketBreakdown && result.bracketBreakdown.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">{translate('breakdownByBracket')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart
                      data={result.bracketBreakdown.map((item) => ({
                        tramo: `${translate('bracket')} ${item.bracket}`,
                        impuesto: item.bracketTax,
                        alicuota: item.rate,
                      }))}
                      xKey="tramo"
                      yKey="impuesto"
                      color="#ef4444"
                      height={200}
                      formatY={(v) => formatCurrency(Number(v))}
                    />
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 text-muted-foreground">{translate('bracket')}</th>
                            <th className="text-right py-2 text-muted-foreground">{translate('from')}</th>
                            <th className="text-right py-2 text-muted-foreground">{translate('to')}</th>
                            <th className="text-right py-2 text-muted-foreground">{translate('rate')}</th>
                            <th className="text-right py-2 text-muted-foreground">{translate('taxBase')}</th>
                            <th className="text-right py-2 text-muted-foreground">{translate('tax')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.bracketBreakdown.map((bracket) => (
                            <tr key={bracket.bracket} className="border-b border-border/50">
                              <td className="py-2 text-foreground">{bracket.bracket}</td>
                              <td className="text-right py-2 text-muted-foreground">
                                {formatCurrency(bracket.from)}
                              </td>
                              <td className="text-right py-2 text-muted-foreground">
                                {formatCurrency(bracket.to)}
                              </td>
                              <td className="text-right py-2 text-primary">{bracket.rate}%</td>
                              <td className="text-right py-2 text-foreground">
                                {formatCurrency(bracket.taxableBase)}
                              </td>
                              <td className="text-right py-2 text-red-500">
                                {formatCurrency(bracket.bracketTax)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-card h-full min-h-[400px] flex items-center justify-center">
              <CardContent className="text-center">
                <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {translate('completeFormMessage')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
