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

export default function IncomeTaxPage() {
  const [formData, setFormData] = useState<IncomeTaxRequest>({
    grossMonthlySalary: 0,
    employeeType: 'RELACION_DEPENDENCIA',
    hasSpouse: false,
    numberOfChildren: 0,
    healthInsurance: undefined,
    retirement: undefined,
    union: undefined,
    housingRent: undefined,
    domesticService: undefined,
    educationalExpenses: undefined,
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Income Tax Calculator</h1>
        <p className="text-gray-400 text-sm mt-1">
          Calculate your tax with updated 2025 brackets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-primary" />
              Employee Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic data */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Gross Monthly Salary
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Employee Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={
                        formData.employeeType === 'RELACION_DEPENDENCIA' ? 'default' : 'outline'
                      }
                      onClick={() => handleInputChange('employeeType', 'RELACION_DEPENDENCIA')}
                      className="w-full"
                    >
                      Employee
                    </Button>
                    <Button
                      type="button"
                      variant={formData.employeeType === 'AUTONOMO' ? 'default' : 'outline'}
                      onClick={() => handleInputChange('employeeType', 'AUTONOMO')}
                      className="w-full"
                    >
                      Self-Employed
                    </Button>
                  </div>
                </div>
              </div>

              {/* Family dependents */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Users className="h-4 w-4" />
                  Family Dependents
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Spouse</label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={formData.hasSpouse ? 'default' : 'outline'}
                        onClick={() => handleInputChange('hasSpouse', true)}
                      >
                        Yes
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={!formData.hasSpouse ? 'default' : 'outline'}
                        onClick={() => handleInputChange('hasSpouse', false)}
                      >
                        No
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Number of Children</label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.numberOfChildren}
                      onChange={(e) =>
                        handleInputChange('numberOfChildren', parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Optional deductions */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Home className="h-4 w-4" />
                  Optional Deductions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Housing Rent</label>
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
                    <label className="block text-xs text-gray-400 mb-1">Domestic Service</label>
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
                  <label className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                    <GraduationCap className="h-3 w-3" />
                    Educational Expenses
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.educationalExpenses || ''}
                    onChange={(e) =>
                      handleInputChange('educationalExpenses', parseFloat(e.target.value) || undefined)
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
                    Calculating...
                  </>
                ) : (
                  'Calculate Tax'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Main summary */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Calculation Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">Annual Gross Salary</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(result.annualGrossSalary)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">Total Deductions</p>
                      <p className="text-xl font-bold text-green-500">
                        {formatCurrency(result.totalDeductions)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">Taxable Net Income</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(result.taxableNetIncome)}
                      </p>
                    </div>
                    <div className="p-4 bg-red-900/30 rounded-lg border border-red-800">
                      <p className="text-xs text-gray-400">Annual Tax</p>
                      <p className="text-xl font-bold text-red-500">
                        {formatCurrency(result.annualTax)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-400">Monthly Tax</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(result.monthlyTax)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Effective Rate</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatPercent(result.effectiveRate)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-xs text-gray-400">Monthly Net Salary (after tax)</p>
                      <p className="text-xl font-bold text-green-500">
                        {formatCurrency(result.monthlyNetSalary)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deductions detail */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Deductions Detail</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Non-Taxable Minimum</span>
                      <span className="text-white">
                        {formatCurrency(result.calculationDetail.nonTaxableMinimum)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Special Deduction</span>
                      <span className="text-white">
                        {formatCurrency(result.calculationDetail.specialDeduction)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Family Dependents</span>
                      <span className="text-white">
                        {formatCurrency(result.calculationDetail.familyDependents)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Personal Deductions</span>
                      <span className="text-white">
                        {formatCurrency(result.calculationDetail.personalDeductions)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 font-bold">
                      <span className="text-white">Total Allowed Deductions</span>
                      <span className="text-green-500">
                        {formatCurrency(result.calculationDetail.totalAllowedDeductions)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Brackets chart */}
              {result.bracketBreakdown && result.bracketBreakdown.length > 0 && (
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Breakdown by Bracket</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart
                      data={result.bracketBreakdown.map((t) => ({
                        tramo: `Bracket ${t.bracket}`,
                        impuesto: t.bracketTax,
                        alicuota: t.rate,
                      }))}
                      xKey="tramo"
                      yKey="impuesto"
                      color="#ef4444"
                      height={200}
                      formatY={(v) => formatCurrency(v)}
                    />
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left py-2 text-gray-400">Bracket</th>
                            <th className="text-right py-2 text-gray-400">From</th>
                            <th className="text-right py-2 text-gray-400">To</th>
                            <th className="text-right py-2 text-gray-400">Rate</th>
                            <th className="text-right py-2 text-gray-400">Tax Base</th>
                            <th className="text-right py-2 text-gray-400">Tax</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.bracketBreakdown.map((bracket) => (
                            <tr key={bracket.bracket} className="border-b border-gray-800/50">
                              <td className="py-2 text-white">{bracket.bracket}</td>
                              <td className="text-right py-2 text-gray-400">
                                {formatCurrency(bracket.from)}
                              </td>
                              <td className="text-right py-2 text-gray-400">
                                {formatCurrency(bracket.to)}
                              </td>
                              <td className="text-right py-2 text-primary">{bracket.rate}%</td>
                              <td className="text-right py-2 text-white">
                                {formatCurrency(bracket.taxBase)}
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
                <Calculator className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500">
                  Complete the form to see the calculation result
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
