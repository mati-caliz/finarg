"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpcomingHolidays } from "@/hooks/useHolidays";
import { useTranslation } from "@/hooks/useTranslation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays } from "lucide-react";

export function NextHolidayWidget() {
  const { data: holidays, isLoading, error } = useUpcomingHolidays("ar");
  const { translate } = useTranslation();

  if (isLoading) {
    return (
      <Card className="border-t-[3px] border-t-violet-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            {translate("nextHoliday")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("Error cargando feriados:", error);
    return (
      <Card className="border-t-[3px] border-t-red-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            {translate("nextHoliday")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">Error al cargar feriados</p>
          <p className="text-xs text-muted-foreground mt-1">
            Verificá que el backend esté corriendo
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!holidays || holidays.length === 0) {
    console.warn("No hay feriados disponibles");
    return (
      <Card className="border-t-[3px] border-t-amber-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            {translate("nextHoliday")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No hay feriados próximos</p>
        </CardContent>
      </Card>
    );
  }

  const nextHoliday = holidays[0];
  const holidayDate = new Date(nextHoliday.date);

  return (
    <Card className="border-t-[3px] border-t-violet-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          {translate("nextHoliday")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
            {nextHoliday.daysUntil === 0
              ? translate("today")
              : nextHoliday.daysUntil === 1
                ? translate("tomorrow")
                : `${nextHoliday.daysUntil} ${translate("days")}`}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {format(holidayDate, "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </div>

        <div className="pt-2 border-t">
          <p className="font-medium text-sm">{nextHoliday.name}</p>
          {nextHoliday.isNational && (
            <p className="text-xs text-muted-foreground mt-1">{translate("nationalHoliday")}</p>
          )}
        </div>

        {holidays.length > 1 && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              {translate("upcomingHolidays")}:
            </p>
            <div className="space-y-1">
              {holidays.slice(1, 4).map((holiday) => {
                const date = new Date(holiday.date);
                return (
                  <div key={holiday.date} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {format(date, "d MMM", { locale: es })}
                    </span>
                    <span className="font-medium truncate ml-2">{holiday.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
