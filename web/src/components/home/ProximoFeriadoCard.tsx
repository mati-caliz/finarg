"use client";

import { Badge, Card } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useHolidays } from "@/hooks/useLabrecha";
import {
  daysUntil,
  daysUntilLabel,
  formatLongDate,
  holidayLabel,
  upcomingHolidays,
} from "@/lib/holidays";
import Link from "next/link";

export function ProximoFeriadoCard() {
  const currentYear = new Date().getUTCFullYear();
  const thisYear = useHolidays({ year: currentYear });
  const nextYear = useHolidays({ year: currentYear + 1 });

  if (thisYear.isLoading || nextYear.isLoading) {
    return <Skeleton className="h-[220px] rounded-[10px]" />;
  }

  const all = [...(thisYear.data ?? []), ...(nextYear.data ?? [])];
  const upcoming = upcomingHolidays(all, undefined, 4);
  if (upcoming.length === 0) {
    return null;
  }

  const [next, ...rest] = upcoming;
  const days = daysUntil(next.date);

  return (
    <Card
      title="Próximo feriado"
      subtitle="Feriados nacionales de Argentina"
      actions={<Badge tone="evento">{daysUntilLabel(days)}</Badge>}
      footer={
        <Link href="/feriados" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
          Ver el calendario completo →
        </Link>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-body)" }}>
            {holidayLabel(next)}
          </div>
          <div
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              textTransform: "capitalize",
              marginTop: 2,
            }}
          >
            {formatLongDate(next.date)}
          </div>
        </div>

        {rest.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--text-muted)" }}>
              Después
            </span>
            {rest.map((holiday) => (
              <div
                key={`${holiday.date}-${holiday.name}`}
                style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: "0.8125rem" }}
              >
                <span style={{ color: "var(--text-body)" }}>{holidayLabel(holiday)}</span>
                <span
                  className="num"
                  style={{ color: "var(--text-muted)", textTransform: "capitalize", flexShrink: 0 }}
                >
                  {formatLongDate(holiday.date).replace(/, \d{4}$/, "")}
                </span>
              </div>
            ))}
          </div>
        )}

        <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
          Fuente: Nager.Date
        </span>
      </div>
    </Card>
  );
}
