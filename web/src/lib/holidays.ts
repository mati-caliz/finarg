import type { Holiday } from "@/lib/labrechaApi";

const MS_PER_DAY = 86_400_000;

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function toUtcMidnight(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  return Date.UTC(year, (month ?? 1) - 1, day ?? 1);
}

export function daysUntil(isoDate: string, fromISO: string = todayISO()): number {
  return Math.round((toUtcMidnight(isoDate) - toUtcMidnight(fromISO)) / MS_PER_DAY);
}

export function holidayLabel(holiday: Holiday): string {
  return holiday.local_name ?? holiday.name;
}

export function formatLongDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function daysUntilLabel(days: number): string {
  if (days <= 0) {
    return "hoy";
  }
  if (days === 1) {
    return "mañana";
  }
  return `en ${days} días`;
}

export function upcomingHolidays(
  holidays: Holiday[],
  fromISO: string = todayISO(),
  count = 4,
): Holiday[] {
  return holidays
    .filter((holiday) => holiday.date >= fromISO)
    .sort((first, second) => (first.date < second.date ? -1 : first.date > second.date ? 1 : 0))
    .slice(0, count);
}
