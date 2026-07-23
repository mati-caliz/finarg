"use client";

import { Badge, Card, RangeSelector } from "@/components/core";
import { QueryError } from "@/components/QueryError";
import { Skeleton } from "@/components/ui/skeleton";
import { useHolidays } from "@/hooks/useLabrecha";
import {
  daysUntil,
  daysUntilLabel,
  formatLongDate,
  freeRunAround,
  holidayLabel,
  isWeekend,
  todayISO,
  weekdayMondayFirst,
} from "@/lib/holidays";
import type { Holiday } from "@/lib/labrechaApi";
import { CalendarDays, PartyPopper, Sun } from "lucide-react";
import { useState } from "react";

const WEEKDAY_HEADERS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTH_COUNT = 12;
const LONG_WEEKEND_MIN_DAYS = 3;
const WORKWEEK_DAYS = 5;

function monthName(year: number, monthIndex: number): string {
  return new Date(Date.UTC(year, monthIndex, 1)).toLocaleDateString("es-AR", {
    month: "long",
    timeZone: "UTC",
  });
}

function isoDate(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDayMonth(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}

interface MonthCalendarProps {
  year: number;
  monthIndex: number;
  holidaysByDate: Map<string, Holiday[]>;
  today: string;
}

function MonthCalendar({ year, monthIndex, holidaysByDate, today }: MonthCalendarProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const leadingBlanks = weekdayMondayFirst(isoDate(year, monthIndex, 1));
  const containsToday = today.startsWith(`${year}-${String(monthIndex + 1).padStart(2, "0")}`);

  const cells: { key: string; day: number | null }[] = [
    ...Array.from({ length: leadingBlanks }, (_, blankOffset) => ({
      key: `void-${monthIndex}-${blankOffset}`,
      day: null,
    })),
    ...Array.from({ length: daysInMonth }, (_, dayOffset) => ({
      key: isoDate(year, monthIndex, dayOffset + 1),
      day: dayOffset + 1,
    })),
  ];

  return (
    <div
      style={{
        background: "var(--surface-inset)",
        border: `1px solid ${containsToday ? "var(--accent-border)" : "var(--border-1)"}`,
        borderRadius: "var(--radius-md)",
        padding: "10px 12px 12px",
      }}
    >
      <div
        style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          color: containsToday ? "var(--accent-strong)" : "var(--text-body)",
          textTransform: "capitalize",
          marginBottom: 8,
        }}
      >
        {monthName(year, monthIndex)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 2 }}>
        {WEEKDAY_HEADERS.map((header, headerIndex) => (
          <span
            key={header}
            style={{
              fontSize: "0.5625rem",
              fontWeight: 600,
              color: headerIndex >= WORKWEEK_DAYS ? "var(--text-faint)" : "var(--text-muted)",
              textAlign: "center",
              paddingBottom: 2,
            }}
          >
            {header}
          </span>
        ))}
        {cells.map(({ key, day }) => {
          if (day === null) {
            return <span key={key} />;
          }
          const date = key;
          const dayHolidays = holidaysByDate.get(date);
          const isHoliday = dayHolidays !== undefined;
          const isToday = date === today;
          const isPastHoliday = isHoliday && date < today;
          const hovered = hoveredDate === date;
          return (
            <span
              key={date}
              onMouseEnter={isHoliday ? () => setHoveredDate(date) : undefined}
              onMouseLeave={isHoliday ? () => setHoveredDate(null) : undefined}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 24,
              }}
            >
              <span
                className="num"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  fontSize: "0.625rem",
                  fontWeight: isHoliday || isToday ? 700 : 500,
                  color: isHoliday
                    ? "#ffffff"
                    : isWeekend(date)
                      ? "var(--text-faint)"
                      : "var(--text-secondary)",
                  background: isHoliday ? "var(--ds-accent)" : "transparent",
                  opacity: isPastHoliday ? 0.45 : 1,
                  boxShadow: isToday ? "0 0 0 1.5px var(--accent-strong)" : "none",
                  cursor: isHoliday ? "default" : undefined,
                }}
              >
                {day}
              </span>
              {hovered && dayHolidays && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "calc(100% + 4px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 10,
                    background: "var(--surface-card)",
                    border: "1px solid var(--border-2)",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "var(--shadow-overlay)",
                    padding: "6px 9px",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                  }}
                >
                  {dayHolidays.map((holiday) => (
                    <span
                      key={holiday.name}
                      style={{
                        display: "block",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        color: "var(--text-body)",
                      }}
                    >
                      {holidayLabel(holiday)}
                    </span>
                  ))}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

interface StatTileProps {
  icon: React.ElementType;
  value: string;
  label: string;
}

function StatTile({ icon: Icon, value, label }: StatTileProps) {
  return (
    <div
      style={{
        flex: "1 1 150px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        border: "1px solid var(--border-1)",
        borderRadius: "var(--radius-md)",
        padding: "12px 14px",
        background: "var(--surface-inset)",
      }}
    >
      <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--ds-accent)" }} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span className="num" style={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.1 }}>
          {value}
        </span>
        <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{label}</span>
      </div>
    </div>
  );
}

function NextHolidayHero({ holiday, holidayDates }: { holiday: Holiday; holidayDates: Set<string> }) {
  const days = daysUntil(holiday.date);
  const freeRun = freeRunAround(holiday.date, holidayDates);
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 20,
        border: "1px solid var(--accent-border)",
        borderRadius: "var(--radius-lg)",
        background: "var(--accent-soft)",
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: 84,
        }}
      >
        <span
          className="num"
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            lineHeight: 1,
            color: "var(--accent-strong)",
          }}
        >
          {days}
        </span>
        <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--text-secondary)" }}>
          {days === 1 ? "día" : "días"}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--accent-strong)" }}>
          PRÓXIMO FERIADO
        </span>
        <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-body)" }}>
          {holidayLabel(holiday)}
        </span>
        <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", textTransform: "capitalize" }}>
          {formatLongDate(holiday.date)}
        </span>
      </div>
      {freeRun.length >= LONG_WEEKEND_MIN_DAYS && (
        <Badge tone="evento">
          {`Finde largo de ${freeRun.length} días · ${formatDayMonth(freeRun.start)} al ${formatDayMonth(freeRun.end)}`}
        </Badge>
      )}
    </div>
  );
}

export function HolidaysCalendar() {
  const currentYear = new Date().getUTCFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  const [year, setYear] = useState(currentYear);
  const { data, isLoading, isError, error, refetch } = useHolidays({ year });

  const holidays = [...(data ?? [])].sort((first, second) =>
    first.date < second.date ? -1 : first.date > second.date ? 1 : 0,
  );
  const today = todayISO();
  const holidayDates = new Set(holidays.map((holiday) => holiday.date));
  const holidaysByDate = new Map<string, Holiday[]>();
  for (const holiday of holidays) {
    const existing = holidaysByDate.get(holiday.date) ?? [];
    holidaysByDate.set(holiday.date, [...existing, holiday]);
  }

  const nextHoliday = holidays.find((holiday) => holiday.date >= today);
  const weekdayHolidayCount = [...holidayDates].filter((date) => !isWeekend(date)).length;
  const longWeekendStarts = new Set(
    [...holidayDates]
      .map((date) => freeRunAround(date, holidayDates))
      .filter((run) => run.length >= LONG_WEEKEND_MIN_DAYS)
      .map((run) => run.start),
  );

  if (isError) {
    return <QueryError error={error} onRetry={() => refetch()} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-5)" }}>
      {isLoading ? (
        <>
          <Skeleton className="h-[110px] rounded-[10px]" />
          <Skeleton className="h-[520px] rounded-[10px]" />
        </>
      ) : (
        <>
          {year === currentYear && nextHoliday && (
            <NextHolidayHero holiday={nextHoliday} holidayDates={holidayDates} />
          )}

          <Card
            title={`Calendario ${year}`}
            subtitle="Los feriados en azul; el día de hoy, resaltado. Pasá el mouse por un feriado para ver cuál es."
            actions={
              <RangeSelector
                options={years.map(String)}
                active={String(year)}
                onChange={(value) => setYear(Number(value))}
              />
            }
            footer={
              <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                Feriados nacionales de Argentina. Fuente: Nager.Date.
              </span>
            }
          >
            {holidays.length === 0 ? (
              <p style={{ color: "var(--text-muted)", margin: 0 }}>
                No hay feriados cargados para {year}.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <StatTile
                    icon={PartyPopper}
                    value={String(holidays.length)}
                    label={`feriados en ${year}`}
                  />
                  <StatTile
                    icon={CalendarDays}
                    value={String(weekdayHolidayCount)}
                    label="caen en día hábil"
                  />
                  <StatTile
                    icon={Sun}
                    value={String(longWeekendStarts.size)}
                    label="findes largos (3+ días)"
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  }}
                >
                  {Array.from({ length: MONTH_COUNT }, (_, monthIndex) => (
                    <MonthCalendar
                      key={isoDate(year, monthIndex, 1)}
                      year={year}
                      monthIndex={monthIndex}
                      holidaysByDate={holidaysByDate}
                      today={today}
                    />
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {holidays.map((holiday) => {
                    const days = daysUntil(holiday.date);
                    const isPast = days < 0;
                    const freeRun = freeRunAround(holiday.date, holidayDates);
                    return (
                      <div
                        key={`${holiday.date}-${holiday.name}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 14px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border-1)",
                          background: "var(--surface-inset)",
                          opacity: isPast ? 0.55 : 1,
                        }}
                      >
                        <span
                          className="num"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 44,
                            height: 44,
                            borderRadius: "var(--radius-md)",
                            background: "var(--ds-accent)",
                            color: "#ffffff",
                            flexShrink: 0,
                            lineHeight: 1.1,
                          }}
                        >
                          <span style={{ fontSize: "1rem", fontWeight: 700 }}>
                            {Number(holiday.date.slice(8, 10))}
                          </span>
                          <span style={{ fontSize: "0.5625rem", fontWeight: 600, textTransform: "uppercase" }}>
                            {monthName(year, Number(holiday.date.slice(5, 7)) - 1).slice(0, 3)}
                          </span>
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-body)" }}>
                            {holidayLabel(holiday)}
                          </span>
                          <span
                            style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "capitalize" }}
                          >
                            {formatLongDate(holiday.date)}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          {freeRun.length >= LONG_WEEKEND_MIN_DAYS && (
                            <Badge tone="evento">{`Finde de ${freeRun.length} días`}</Badge>
                          )}
                          {!isPast && days <= 45 && <Badge tone="accent">{daysUntilLabel(days)}</Badge>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
