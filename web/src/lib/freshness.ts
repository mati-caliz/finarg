import { type Cadence, cadenceForCode } from "@/lib/indicators";

const MS_PER_DAY = 86_400_000;

export const MAX_AGE_DAYS: Record<Cadence, number> = {
  diaria: 5,
  mensual: 55,
  trimestral: 135,
  semestral: 250,
  anual: 430,
};

function toUtcMidnight(isoDate: string): number {
  const [year = 0, month = 1, day = 1] = isoDate.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function daysSince(isoDate: string, fromMs: number = Date.now()): number {
  return Math.floor((fromMs - toUtcMidnight(isoDate)) / MS_PER_DAY);
}

export interface Freshness {
  stale: boolean;
  days: number;
  cadence: Cadence;
}

export function freshnessForCode(code: string, lastDate: string): Freshness {
  const cadence = cadenceForCode(code);
  const days = daysSince(lastDate);
  return { stale: days > MAX_AGE_DAYS[cadence], days, cadence };
}

export const TAX_SCALE_MAX_AGE_DAYS = 185;

export function isTaxScaleOutdated(effectiveFrom: string, fromMs: number = Date.now()): boolean {
  return daysSince(effectiveFrom, fromMs) > TAX_SCALE_MAX_AGE_DAYS;
}
