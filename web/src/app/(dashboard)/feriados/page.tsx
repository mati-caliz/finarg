import { HolidaysCalendar } from "@/components/holidays/HolidaysCalendar";
import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feriados Argentina 2026 - Calendario Completo | FinArg",
  description:
    "Calendario completo de feriados de Argentina 2026. Feriados nacionales, días no laborables y puentes. Información actualizada.",
  keywords: [
    "feriados argentina 2026",
    "calendario feriados",
    "días no laborables",
    "feriados nacionales",
  ],
};

export default function FeriadosPage() {
  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CalendarDays className="w-8 h-8 text-violet-600 dark:text-violet-400" />
          <h1 className="text-3xl font-bold">Feriados Argentina 2026</h1>
        </div>
        <p className="text-muted-foreground">
          Calendario completo de feriados nacionales y días no laborables
        </p>
      </div>

      <HolidaysCalendar />
    </div>
  );
}
