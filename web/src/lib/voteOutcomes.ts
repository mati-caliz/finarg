export interface VoteOutcome {
  voteRecordId: string;
  indicatorCode: string;
  reading: string;
}

export const VOTE_OUTCOMES: VoteOutcome[] = [
  {
    voteRecordId: "3934",
    indicatorCode: "dollar_blue",
    reading:
      "La ley se votó en el marco de la emergencia pública y delegó facultades en materia impositiva, previsional y cambiaria. El dólar paralelo es la serie que reacciona primero a un cambio de régimen cambiario, así que es la que miramos desde esa fecha.",
  },
  {
    voteRecordId: "3960",
    indicatorCode: "country_risk",
    reading:
      "La votación declaró prioritario recuperar la sostenibilidad de la deuda externa, el paso previo a la reestructuración. El riesgo país es el precio que el mercado le pone justamente a la probabilidad de que esa deuda se pague.",
  },
  {
    voteRecordId: "3961",
    indicatorCode: "primary_balance",
    reading:
      "El acuerdo fiscal ordena la relación económica entre la Nación, las provincias y la Ciudad. Lo que ese arreglo condiciona se ve en las cuentas del Estado nacional: acá está el resultado primario desde entonces.",
  },
];

export function voteOutcomesFor(voteRecordId: string): VoteOutcome[] {
  return VOTE_OUTCOMES.filter((outcome) => outcome.voteRecordId === voteRecordId);
}
