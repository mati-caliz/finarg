import { VoteDetail } from "@/components/congress/VoteDetail";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Votación - La Brecha",
  description:
    "Detalle de una votación nominal de la Cámara de Diputados, con el voto de cada bloque.",
};

interface VotePageProps {
  params: Promise<{ voteRecordId: string }>;
}

export default async function VotePage({ params }: VotePageProps) {
  const { voteRecordId } = await params;
  return <VoteDetail voteRecordId={voteRecordId} />;
}
