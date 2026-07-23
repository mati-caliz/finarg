import type { PostImpactKind } from "@/lib/labrechaApi";
import {
  Clock,
  Eye,
  HeartPulse,
  Landmark,
  Leaf,
  type LucideIcon,
  Wallet,
} from "lucide-react";

export interface ImpactKindMeta {
  label: string;
  icon: LucideIcon;
  color: string;
  background: string;
  border: string;
}

export const POST_IMPACT_META: Record<PostImpactKind, ImpactKindMeta> = {
  tiempo: {
    label: "Tiempo",
    icon: Clock,
    color: "var(--brecha)",
    background: "var(--brecha-bg)",
    border: "var(--brecha-ln)",
  },
  dinero: {
    label: "Plata",
    icon: Wallet,
    color: "var(--brecha)",
    background: "var(--brecha-bg)",
    border: "transparent",
  },
  ambiente: {
    label: "Ambiente",
    icon: Leaf,
    color: "var(--pos)",
    background: "var(--pos-bg)",
    border: "transparent",
  },
  vidas: {
    label: "Vidas",
    icon: HeartPulse,
    color: "var(--neg)",
    background: "var(--neg-bg)",
    border: "transparent",
  },
  estado: {
    label: "Estado",
    icon: Landmark,
    color: "var(--evento)",
    background: "var(--evento-bg)",
    border: "transparent",
  },
  transparencia: {
    label: "Transparencia",
    icon: Eye,
    color: "var(--ink2)",
    background: "var(--surface)",
    border: "var(--line)",
  },
};

const WORDS_PER_MINUTE = 200;

export function readingTimeMinutes(content: string): number {
  const words = content.split(/\s+/).filter((word) => word.length > 0).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
