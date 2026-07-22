"use client";

import { Badge, Card, RangeSelector } from "@/components/core";
import { QueryError } from "@/components/QueryError";
import { Skeleton } from "@/components/ui/skeleton";
import { useHolidays } from "@/hooks/useLabrecha";
import type { Holiday } from "@/lib/labrechaApi";
import { daysUntil, daysUntilLabel, formatLongDate, holidayLabel, todayISO } from "@/lib/holidays";
import { useState } from "react";

function HolidayRow({ holiday }: { holiday: Holiday }) {
  const days = daysUntil(holiday.date);
  const isPast = days < 0;
  const isNext = days >= 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 14px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-1)",
        background: "var(--surface-inset)",
        opacity: isPast ? 0.55 : 1,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-body)" }}>
          {holidayLabel(holiday)}
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
          {formatLongDate(holiday.date)}
        </span>
      </div>
      {isNext && days <= 45 && <Badge tone="evento">{daysUntilLabel(days)}</Badge>}
    </div>
  );
}

export function HolidaysList() {
  const currentYear = new Date().getUTCFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  const [year, setYear] = useState(currentYear);
  const { data, isLoading, isError, error, refetch } = useHolidays({ year });

  const holidays = [...(data ?? [])].sort((first, second) =>
    first.date < second.date ? -1 : first.date > second.date ? 1 : 0,
  );
  const today = todayISO();
  const nextIndex = holidays.findIndex((holiday) => holiday.date >= today);

  return (
    <Card
      title={`Feriados nacionales ${year}`}
      subtitle="Argentina — fuente Nager.Date"
      actions={
        <RangeSelector
          options={years.map(String)}
          active={String(year)}
          onChange={(value) => setYear(Number(value))}
        />
      }
    >
      {isError ? (
        <QueryError error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton className="h-[56px] rounded-[8px]" />
          <Skeleton className="h-[56px] rounded-[8px]" />
          <Skeleton className="h-[56px] rounded-[8px]" />
        </div>
      ) : holidays.length === 0 ? (
        <p style={{ color: "var(--text-muted)", margin: 0 }}>No hay feriados cargados para {year}.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {holidays.map((holiday, index) => (
            <div key={`${holiday.date}-${holiday.name}`}>
              {index === nextIndex && nextIndex > 0 && (
                <div
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    margin: "6px 0",
                  }}
                >
                  Próximos
                </div>
              )}
              <HolidayRow holiday={holiday} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
