export interface ChartDataPoint {
  month: number;
  nominalValue: number;
  presentValue: number;
}

export interface CalculationResult {
  cashPrice: number;
  installmentPrice: number;
  numberOfInstallments: number;
  installmentValue: number;
  monthlyInflation: number;
  presentValue: number;
  savings: number;
  savingsPercent: number;
  recommendation: "cash" | "installments";
  chartData: ChartDataPoint[];
}

export interface SavedCalculation {
  id: string;
  name: string;
  cashPrice: number;
  installmentValue: number;
  numberOfInstallments: number;
  monthlyInflation: number;
  savedAt: string;
}

export interface InflationComparison {
  inflationRate: number;
  presentValue: number;
  savings: number;
  savingsPercent: number;
  recommendation: "cash" | "installments";
}
