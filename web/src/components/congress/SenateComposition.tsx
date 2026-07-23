"use client";

import { Card } from "@/components/core";
import {
  BlocLegend,
  HemicycleChart,
  type HemicycleBloc,
  type HemicycleSeat,
} from "@/components/congress/HemicycleChart";
import { Skeleton } from "@/components/ui/skeleton";
import { useSenateMembers } from "@/hooks/useLabrecha";
import { blocColor } from "@/lib/congress";
import type { Senator } from "@/lib/labrechaApi";

const UNKNOWN_BLOC = "Sin bloque";

function senatorFullName(senator: Senator): string {
  return [senator.first_name, senator.last_name].filter(Boolean).join(" ") || senator.senator_id;
}

function mandateYears(senator: Senator): string | null {
  const start = senator.mandate_start?.slice(0, 4);
  const end = senator.mandate_end?.slice(0, 4);
  if (!start && !end) {
    return null;
  }
  return `Mandato ${start ?? "?"}–${end ?? "?"}`;
}

export function SenateComposition() {
  const { data, isLoading } = useSenateMembers();

  if (isLoading) {
    return <Skeleton className="h-80 w-full rounded-[10px]" />;
  }

  const senators = data ?? [];
  if (senators.length === 0) {
    return null;
  }

  const countByBloc = new Map<string, number>();
  for (const senator of senators) {
    const bloc = senator.bloc ?? UNKNOWN_BLOC;
    countByBloc.set(bloc, (countByBloc.get(bloc) ?? 0) + 1);
  }
  const blocs: HemicycleBloc[] = [...countByBloc.entries()]
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
    .map(([name, count], index) => ({ name, count, color: blocColor(index) }));

  const blocOrder = new Map(blocs.map((bloc, index) => [bloc.name, index]));
  const seats: HemicycleSeat[] = [...senators]
    .sort((first, second) => {
      const firstBloc = blocOrder.get(first.bloc ?? UNKNOWN_BLOC) ?? Number.MAX_SAFE_INTEGER;
      const secondBloc = blocOrder.get(second.bloc ?? UNKNOWN_BLOC) ?? Number.MAX_SAFE_INTEGER;
      return firstBloc - secondBloc;
    })
    .map((senator) => ({
      id: senator.senator_id,
      occupantName: senatorFullName(senator),
      bloc: senator.bloc ?? UNKNOWN_BLOC,
      detailLines: [
        senator.province,
        senator.party && senator.party !== senator.bloc ? senator.party : null,
        mandateYears(senator),
      ].filter((line): line is string => line !== null && line !== ""),
    }));

  const total = seats.length;
  const majority = Math.floor(total / 2) + 1;

  return (
    <Card
      title="Composición del Senado"
      subtitle={`${total} bancas · mayoría en ${majority} · pasá el mouse por cada banca`}
      footer={
        <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
          Fuente: Senado de la Nación (datos abiertos)
        </span>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ maxWidth: 560, margin: "0 auto", width: "100%" }}>
          <HemicycleChart
            seats={seats}
            blocs={blocs}
            majority={majority}
            ariaLabel={`Hemiciclo del Senado: ${total} bancas coloreadas por bloque`}
          />
        </div>
        <BlocLegend blocs={blocs} />
      </div>
    </Card>
  );
}
