"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useHolidays } from "@/hooks/useHolidays";
import { useTranslation } from "@/hooks/useTranslation";
import type { TranslationKey } from "@/i18n/translations";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, MapPin } from "lucide-react";
import { useMemo } from "react";

const monthKeys: TranslationKey[] = [
  "monthJanuary",
  "monthFebruary",
  "monthMarch",
  "monthApril",
  "monthMay",
  "monthJune",
  "monthJuly",
  "monthAugust",
  "monthSeptember",
  "monthOctober",
  "monthNovember",
  "monthDecember",
];

export function HolidaysCalendar() {
  const currentYear = new Date().getFullYear();
  const { data: holidays, isLoading, error } = useHolidays("ar", currentYear);
  const { translate } = useTranslation();

  const holidaysByMonth = useMemo(() => {
    if (!holidays) {
      return {};
    }

    return holidays.reduce(
      (acc, holiday) => {
        const date = new Date(holiday.date);
        const month = date.getMonth();
        if (!acc[month]) {
          acc[month] = [];
        }
        acc[month].push(holiday);
        return acc;
      },
      {} as Record<number, typeof holidays>,
    );
  }, [holidays]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">{translate("holidaysLoadError")}</p>
          <p className="text-center text-sm text-red-500 mt-2">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!holidays || holidays.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">{translate("holidaysNoneAvailable")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(holidaysByMonth).map(([monthIndex, monthHolidays]) => {
          const month = Number.parseInt(monthIndex);
          return (
            <Card key={month} className="border-t-[3px] border-t-violet-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {translate(monthKeys[month])}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {monthHolidays.map((holiday) => {
                  const date = new Date(holiday.date);
                  return (
                    <div
                      key={holiday.date}
                      className="p-3 rounded-lg bg-muted/50 border border-border/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{holiday.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(date, "EEEE d 'de' MMMM", { locale: es })}
                          </p>
                        </div>
                        <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                          {format(date, "d")}
                        </div>
                      </div>
                      {holiday.isNational && (
                        <div className="flex items-center gap-1 mt-2">
                          <MapPin className="w-3 h-3 text-violet-500" />
                          <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                            {translate("nationalHoliday")}
                          </span>
                        </div>
                      )}
                      {holiday.daysUntil !== null && holiday.daysUntil >= 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {holiday.daysUntil === 0
                            ? translate("holidaysToday")
                            : holiday.daysUntil === 1
                              ? translate("holidaysTomorrow")
                              : translate("holidaysDaysUntil").replace(
                                  "{days}",
                                  String(holiday.daysUntil),
                                )}
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-t-[3px] border-t-blue-500">
        <CardHeader>
          <CardTitle>
            {translate("holidaysSummary").replace("{year}", String(currentYear))}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                {holidays.filter((h) => h.isNational).length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{translate("holidaysNational")}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                {holidays.filter((h) => h.daysUntil !== null && h.daysUntil >= 0).length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{translate("holidaysUpcoming")}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                {Object.keys(holidaysByMonth).length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {translate("holidaysMonthsWithHolidays")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
