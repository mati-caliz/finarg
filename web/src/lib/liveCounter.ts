const SECONDS_PER_DAY = 24 * 60 * 60;

export function projectedValue(
  baseValue: number,
  ratePerSecond: number,
  sinceMs: number,
  nowMs: number,
): number {
  const elapsedSeconds = Math.max(0, (nowMs - sinceMs) / 1000);
  return baseValue + ratePerSecond * elapsedSeconds;
}

export function startOfCurrentMonth(reference: Date = new Date()): Date {
  return new Date(reference.getFullYear(), reference.getMonth(), 1);
}

export function daysInMonth(reference: Date = new Date()): number {
  return new Date(reference.getFullYear(), reference.getMonth() + 1, 0).getDate();
}

export function monthlyRateToPerSecond(monthlyValue: number, daysInThisMonth: number): number {
  const secondsInMonth = daysInThisMonth * SECONDS_PER_DAY;
  return secondsInMonth > 0 ? monthlyValue / secondsInMonth : 0;
}
