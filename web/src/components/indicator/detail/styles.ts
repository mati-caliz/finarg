import type { CSSProperties } from "react";

export const MONO = "var(--font-jb-mono)";
export const CELL_PAD = "12px 16px";
export const NO_DATA_LABEL = "—";

export const RANGE_OPTIONS = ["6M", "1A", "5A", "Máx"];

const SOURCE_COLORS = ["var(--chart)", "var(--gap)", "var(--serie-3)"];

export function sourceColor(index: number): string {
  return SOURCE_COLORS[index % SOURCE_COLORS.length] ?? "var(--chart)";
}

export const CARD_STYLE: CSSProperties = {
  background: "var(--raise)",
  border: "1px solid var(--line)",
  borderRadius: 10,
};
