import axios from "axios";

const LABRECHA_API_URL = process.env.NEXT_PUBLIC_LABRECHA_API_URL || "/api/data";

export const labrechaApi = axios.create({
  baseURL: LABRECHA_API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export type SortOrder = "asc" | "desc";

export interface IndicatorSummary {
  indicator_code: string;
  sources: string[];
  count: number;
  first_date: string;
  last_date: string;
}

export interface IndicatorSourceSummary {
  source: string;
  count: number;
  first_date: string;
  last_date: string;
  latest_value: string;
}

export interface IndicatorPoint {
  date: string;
  value: string;
  source: string;
  meta: Record<string, unknown>;
}

export interface IndicatorSeries {
  indicator_code: string;
  points: IndicatorPoint[];
}

export interface PoliticalEvent {
  date: string;
  title: string;
  category: string;
  description: string | null;
}

export interface CongressVote {
  acta_id: string;
  period_number: number | null;
  session_type: string | null;
  date: string | null;
  title: string | null;
  result: string | null;
  president_name: string | null;
  affirmative_votes: number | null;
  negative_votes: number | null;
  abstentions: number | null;
  absents: number | null;
}

export interface CongressVoteDetail {
  acta_id: string;
  deputy_name: string | null;
  bloc: string | null;
  district: string | null;
  vote: string | null;
}

export interface SanctionedLaw {
  law_number: string;
  project_id: string | null;
  sanctioning_chamber: string | null;
  initial_file: string | null;
  first_half_sanction: string | null;
  second_half_sanction: string | null;
  final_sanction: string | null;
  title: string | null;
  summary: string | null;
}

export interface Senator {
  senator_id: string;
  last_name: string | null;
  first_name: string | null;
  bloc: string | null;
  province: string | null;
  party: string | null;
  mandate_start: string | null;
  mandate_end: string | null;
}

export interface BlocSummary {
  bloc: string | null;
  count: number;
}

export interface Holiday {
  date: string;
  name: string;
  local_name: string | null;
  is_global: boolean | null;
  is_fixed: boolean | null;
  types: string | null;
}

export interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  source_url: string;
  category: string;
  published_date: string;
  image_url: string | null;
}

export interface IndicatorSeriesParams {
  source?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  order?: SortOrder;
}

export interface CompoundInterestRequest {
  initial_capital: number;
  annual_rate: number;
  years: number;
  compounding_frequency: "MONTHLY" | "QUARTERLY" | "YEARLY";
  periodic_contribution?: number;
}

export interface CompoundInterestPeriod {
  period: number;
  principal: string;
  interest: string;
  total: string;
}

export interface CompoundInterestResponse {
  final_amount: string;
  total_contributions: string;
  total_interest: string;
  periods: CompoundInterestPeriod[];
}

export interface InflationAdjustmentRequest {
  amount: number;
  from_date: string;
  to_date: string;
}

export interface InflationAdjustmentResponse {
  original_amount: string;
  adjusted_amount: string;
  from_date: string;
  to_date: string;
  cumulative_inflation: string;
  months_elapsed: number;
}

export interface IncomeTaxRequest {
  gross_monthly_salary: number;
  retired?: boolean;
  health_insurance?: number | null;
  retirement?: number | null;
  union_dues?: number | null;
  union_dues_percent?: number | null;
  has_spouse?: boolean;
  number_of_children?: number;
  children_with_disabilities_count?: number;
  housing_rent?: number | null;
  domestic_service?: number | null;
  education_expenses?: number | null;
  life_insurance?: number | null;
}

export interface IncomeTaxResponse {
  gross_monthly_salary: string;
  gross_annual_salary: string;
  monthly_legal_deductions: string;
  total_deductions: string;
  taxable_income: string;
  annual_tax: string;
  monthly_tax: string;
  effective_rate: string;
  net_monthly_salary: string;
  calculation_details: Record<string, string>;
  deduction_breakdown: Record<string, string>;
  tax_brackets: Array<Record<string, string | number>>;
}

export interface TaxImpactRequest {
  gross_monthly_salary: number;
  monthly_expenses: number;
  retired?: boolean;
  iibb_rate?: number;
}

export interface TaxImpactItem {
  concept: string;
  category: string;
  annual_amount: string;
  monthly_amount: string;
  share_of_income: string;
}

export interface TaxImpactResponse {
  gross_annual_income: string;
  annual_expenses: string;
  total_annual: string;
  total_monthly: string;
  total_pressure: string;
  days_for_the_state: number;
  tax_freedom_date: string;
  items: TaxImpactItem[];
}

async function get<T>(path: string, params?: object): Promise<T> {
  const response = await labrechaApi.get<T>(path, { params });
  return response.data;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await labrechaApi.post<T>(path, body);
  return response.data;
}

export const indicatorsApi = {
  list: () => get<IndicatorSummary[]>("/indicators"),
  series: (code: string, params?: IndicatorSeriesParams) =>
    get<IndicatorSeries>(`/indicators/${code}`, params),
  sources: (code: string) => get<IndicatorSourceSummary[]>(`/indicators/${code}/sources`),
};

export const politicalEventsApi = {
  list: (params?: { date_from?: string; date_to?: string; category?: string }) =>
    get<PoliticalEvent[]>("/political-events", params),
};

export const congressApi = {
  votes: (params?: {
    date_from?: string;
    date_to?: string;
    result?: string;
    period_number?: number;
    limit?: number;
    offset?: number;
  }) => get<CongressVote[]>("/congress/votes", params),
  vote: (actaId: string) => get<CongressVote>(`/congress/votes/${actaId}`),
  voteDetails: (actaId: string, params?: { vote?: string; bloc?: string }) =>
    get<CongressVoteDetail[]>(`/congress/votes/${actaId}/details`, params),
  laws: (params?: {
    date_from?: string;
    date_to?: string;
    chamber?: string;
    limit?: number;
    offset?: number;
  }) => get<SanctionedLaw[]>("/congress/laws", params),
};

export const senateApi = {
  members: (params?: { bloc?: string; province?: string }) =>
    get<Senator[]>("/senate/members", params),
  blocs: () => get<BlocSummary[]>("/senate/blocs"),
};

export const holidaysApi = {
  list: (params?: { year?: number; date_from?: string; date_to?: string }) =>
    get<Holiday[]>("/holidays", params),
};

export const newsApi = {
  list: (params?: { source?: string; category?: string; limit?: number; offset?: number }) =>
    get<NewsArticle[]>("/news", params),
};

export const calculatorsApi = {
  compoundInterest: (body: CompoundInterestRequest) =>
    post<CompoundInterestResponse>("/calculators/compound-interest", body),
  inflationAdjustment: (body: InflationAdjustmentRequest) =>
    post<InflationAdjustmentResponse>("/calculators/inflation-adjustment", body),
  incomeTax: (body: IncomeTaxRequest) => post<IncomeTaxResponse>("/calculators/income-tax", body),
  taxImpact: (body: TaxImpactRequest) => post<TaxImpactResponse>("/calculators/tax-impact", body),
};
