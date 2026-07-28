export const CALCULATOR_PATHS = {
  compoundInterest: "calculators/compound-interest",
  incomeTax: "calculators/income-tax",
  taxImpact: "calculators/tax-impact",
  inflationAdjustment: "calculators/inflation-adjustment",
} as const;

export const CALCULATOR_PATH_LIST: readonly string[] = Object.values(CALCULATOR_PATHS);
