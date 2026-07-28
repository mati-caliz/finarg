export const CHAMBER_DEPUTIES = "diputados";
export const CHAMBER_SENATE = "senadores";

export const CHAMBERS = [CHAMBER_DEPUTIES, CHAMBER_SENATE] as const;

export type Chamber = (typeof CHAMBERS)[number];

const CHAMBER_LABELS: Record<Chamber, string> = {
  [CHAMBER_DEPUTIES]: "Diputados",
  [CHAMBER_SENATE]: "Senado",
};

const CHAMBER_MEMBER_LABELS: Record<Chamber, string> = {
  [CHAMBER_DEPUTIES]: "diputado",
  [CHAMBER_SENATE]: "senador",
};

const CHAMBER_SOURCE_LABELS: Record<Chamber, string> = {
  [CHAMBER_DEPUTIES]: "HCDN",
  [CHAMBER_SENATE]: "Senado de la Nación",
};

export function chamberSourceLabel(chamber: Chamber): string {
  return CHAMBER_SOURCE_LABELS[chamber];
}

export function chamberLabel(chamber: Chamber): string {
  return CHAMBER_LABELS[chamber];
}

export function chamberMemberLabel(chamber: Chamber): string {
  return CHAMBER_MEMBER_LABELS[chamber];
}

export function isChamber(value: string): value is Chamber {
  return CHAMBERS.some((chamber) => chamber === value);
}
