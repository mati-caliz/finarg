"use client";

import { Badge, Card, VoteBar } from "@/components/core";
import { Skeleton } from "@/components/ui/skeleton";
import { useCongressVote, useCongressVoteDetails } from "@/hooks/useLabrecha";
import { normalizeResult, tallyByBloc } from "@/lib/congress";
import { formatDateAR } from "@/lib/indicators";
import Link from "next/link";

interface VoteDetailProps {
  actaId: string;
}

export function VoteDetail({ actaId }: VoteDetailProps) {
  const { data: vote, isLoading: loadingVote } = useCongressVote(actaId);
  const { data: details, isLoading: loadingDetails } = useCongressVoteDetails(actaId);

  if (loadingVote) {
    return <Skeleton className="h-64 w-full rounded-[10px]" />;
  }
  if (!vote) {
    return <p style={{ color: "var(--text-muted)" }}>No se encontró la votación solicitada.</p>;
  }

  const result = normalizeResult(vote.result);
  const blocs = tallyByBloc(details ?? []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
      <Link href="/congreso" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
        ← Volver a Congreso
      </Link>

      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  font: "var(--fw-bold) var(--fs-h2)/var(--lh-heading) var(--font-sans)",
                  margin: 0,
                }}
              >
                {vote.title ?? "Votación"}
              </h1>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
                Diputados · {vote.date ? formatDateAR(vote.date) : "s/f"}
                {vote.session_type ? ` · sesión ${vote.session_type.toLowerCase()}` : ""}
                {vote.president_name ? ` · preside ${vote.president_name}` : ""}
              </div>
            </div>
            <Badge tone={result.won ? "pos" : "neg"}>{result.label}</Badge>
          </div>
          <VoteBar
            height={12}
            afirmativos={vote.affirmative_votes ?? 0}
            negativos={vote.negative_votes ?? 0}
            abstenciones={vote.abstentions ?? 0}
            ausentes={vote.absents ?? 0}
          />
        </div>
      </Card>

      <Card title="Voto por bloque" subtitle="Cómo votó cada bloque de la cámara">
        {loadingDetails ? (
          <Skeleton className="h-40 w-full rounded-[6px]" />
        ) : blocs.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: 0 }}>
            No hay detalle de voto por diputado para esta votación.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {blocs.map((bloc) => (
              <div key={bloc.bloc} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    fontSize: "0.8125rem",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                    {bloc.bloc}
                  </span>
                  <span className="num" style={{ color: "var(--text-muted)" }}>
                    {bloc.total}
                  </span>
                </div>
                <VoteBar
                  height={8}
                  afirmativos={bloc.afirmativos}
                  negativos={bloc.negativos}
                  abstenciones={bloc.abstenciones}
                  ausentes={bloc.ausentes}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
