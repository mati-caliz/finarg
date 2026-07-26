export type AlertDirection = "arriba" | "abajo";

export const THRESHOLD_PARAM = "umbral";
export const DIRECTION_PARAM = "direccion";

export interface ThresholdAlert {
  threshold: number;
  direction: AlertDirection;
}

function parseDirection(raw: string | null): AlertDirection {
  return raw === "abajo" ? "abajo" : "arriba";
}

export function parseThresholdAlert(params: URLSearchParams): ThresholdAlert | null {
  const raw = params.get(THRESHOLD_PARAM);
  if (raw === null || raw.trim() === "") {
    return null;
  }
  const threshold = Number.parseFloat(raw.replace(",", "."));
  if (!Number.isFinite(threshold)) {
    return null;
  }
  return { threshold, direction: parseDirection(params.get(DIRECTION_PARAM)) };
}

export function crossesThreshold(value: number, alert: ThresholdAlert): boolean {
  return alert.direction === "arriba" ? value > alert.threshold : value < alert.threshold;
}

export function describeAlert(alert: ThresholdAlert, formatted: string): string {
  return alert.direction === "arriba"
    ? `sólo cuando supera ${formatted}`
    : `sólo cuando baja de ${formatted}`;
}
