import { HolidaysList } from "@/components/holidays/HolidaysList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feriados de Argentina - La Brecha",
  description: "Calendario de feriados nacionales de Argentina por año, con su fecha y fuente.",
};

export default function FeriadosPage() {
  return (
    <div
      style={{
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--sp-6)",
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h1
          style={{
            font: "var(--fw-bold) var(--fs-h1)/var(--lh-heading) var(--font-sans)",
            color: "var(--text-body)",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Feriados de Argentina
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)", margin: 0 }}>
          Calendario de feriados nacionales, con su fecha y fuente. Los ya pasados quedan atenuados.
        </p>
      </header>

      <HolidaysList />
    </div>
  );
}
