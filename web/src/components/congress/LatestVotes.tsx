"use client";

import { VoteCard } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useCongressVotes } from "@/hooks/useLabrecha";
import { normalizeResult } from "@/lib/congress";
import { formatDateAR } from "@/lib/indicators";

export function LatestVotes() {
  const { data, isLoading } = useCongressVotes({ limit: 9 });

  if (isLoading) {
    return (
      <div
        style={{
          display: "grid",
          gap: "var(--sp-4)",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        }}
      >
        <Skeleton className="h-32 rounded-[10px]" />
        <Skeleton className="h-32 rounded-[10px]" />
        <Skeleton className="h-32 rounded-[10px]" />
      </div>
    );
  }

  const votes = data ?? [];
  if (votes.length === 0) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
        No hay votaciones para mostrar.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "var(--sp-4)",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      }}
    >
      {votes.map((vote) => (
        <VoteCard
          key={vote.acta_id}
          title={vote.title ?? "Votación sin título"}
          date={vote.date ? formatDateAR(vote.date) : "s/f"}
          result={normalizeResult(vote.result).label}
          afirmativos={vote.affirmative_votes ?? 0}
          negativos={vote.negative_votes ?? 0}
          abstenciones={vote.abstentions ?? 0}
          ausentes={vote.absents ?? 0}
          href={`/congreso/votacion/${vote.acta_id}`}
        />
      ))}
    </div>
  );
}
