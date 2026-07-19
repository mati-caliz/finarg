import { VoteDetail } from "@/components/congress/VoteDetail";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Votación - La Brecha",
  description:
    "Detalle de una votación nominal de la Cámara de Diputados, con el voto de cada bloque.",
};

interface VotePageProps {
  params: Promise<{ actaId: string }>;
}

export default async function VotePage({ params }: VotePageProps) {
  const { actaId } = await params;
  return (
    <div style={{ maxWidth: "var(--container-max)", margin: "0 auto" }}>
      <VoteDetail actaId={actaId} />
    </div>
  );
}
