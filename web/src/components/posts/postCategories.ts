import type { BadgeTone } from "@/components/core";
import type { PostCategory } from "@/lib/labrechaApi";

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  idea: "Idea",
  ley: "Ley",
  analisis: "Análisis",
  nota: "Nota",
};

export const POST_CATEGORY_TONES: Record<PostCategory, BadgeTone> = {
  idea: "gap",
  ley: "evento",
  analisis: "accent",
  nota: "neutral",
};

export function formatPostDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
}
