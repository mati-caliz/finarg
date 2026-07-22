import {
  type IndicatorSeriesParams,
  boletinApi,
  congressApi,
  coparticipacionApi,
  viviendaApi,
  holidaysApi,
  indicatorsApi,
  newsApi,
  politicalEventsApi,
  scrapeRunsApi,
  senateApi,
  taxesApi,
} from "@/lib/labrechaApi";
import { useQueries, useQuery } from "@tanstack/react-query";

export const labrechaKeys = {
  indicators: ["labrecha", "indicators"] as const,
  indicatorSeries: (code: string, params?: IndicatorSeriesParams) =>
    ["labrecha", "indicators", code, params ?? {}] as const,
  indicatorSources: (code: string) => ["labrecha", "indicators", code, "sources"] as const,
  politicalEvents: (params?: object) => ["labrecha", "political-events", params ?? {}] as const,
  congressVotes: (params?: object) => ["labrecha", "congress", "votes", params ?? {}] as const,
  congressVote: (actaId: string) => ["labrecha", "congress", "votes", actaId] as const,
  congressLaws: (params?: object) => ["labrecha", "congress", "laws", params ?? {}] as const,
  congressAttendance: ["labrecha", "congress", "attendance"] as const,
  congressVoteDetails: (actaId: string, params?: object) =>
    ["labrecha", "congress", "votes", actaId, "details", params ?? {}] as const,
  senateMembers: (params?: object) => ["labrecha", "senate", "members", params ?? {}] as const,
  senateBlocs: ["labrecha", "senate", "blocs"] as const,
  holidays: (params?: object) => ["labrecha", "holidays", params ?? {}] as const,
  news: (params?: object) => ["labrecha", "news", params ?? {}] as const,
  boletin: (params?: object) => ["labrecha", "boletin", params ?? {}] as const,
  coparticipacion: ["labrecha", "coparticipacion"] as const,
  taxChanges: (params?: object) => ["labrecha", "taxes", "changes", params ?? {}] as const,
  rentByBarrio: ["labrecha", "vivienda", "rent-by-barrio"] as const,
  scrapeRuns: (params?: object) => ["labrecha", "scrape-runs", params ?? {}] as const,
};

export function useIndicators() {
  return useQuery({ queryKey: labrechaKeys.indicators, queryFn: () => indicatorsApi.list() });
}

export function useIndicatorSeries(code: string, params?: IndicatorSeriesParams) {
  return useQuery({
    queryKey: labrechaKeys.indicatorSeries(code, params),
    queryFn: () => indicatorsApi.series(code, params),
    enabled: code.length > 0,
  });
}

export function useIndicatorSeriesMulti(
  code: string,
  sources: string[],
  params?: IndicatorSeriesParams,
) {
  return useQueries({
    queries: sources.map((source) => ({
      queryKey: labrechaKeys.indicatorSeries(code, { ...params, source }),
      queryFn: () => indicatorsApi.series(code, { ...params, source }),
      enabled: code.length > 0,
    })),
  });
}

export function useLegLatest(legs: { code: string; source: string }[]) {
  return useQueries({
    queries: legs.map((leg) => ({
      queryKey: labrechaKeys.indicatorSeries(leg.code, {
        source: leg.source,
        limit: 1,
        order: "desc" as const,
      }),
      queryFn: () => indicatorsApi.series(leg.code, { source: leg.source, limit: 1, order: "desc" }),
    })),
  });
}

export function useIndicatorSources(code: string) {
  return useQuery({
    queryKey: labrechaKeys.indicatorSources(code),
    queryFn: () => indicatorsApi.sources(code),
    enabled: code.length > 0,
  });
}

export function usePoliticalEvents(params?: {
  date_from?: string;
  date_to?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: labrechaKeys.politicalEvents(params),
    queryFn: () => politicalEventsApi.list(params),
  });
}

export function useCongressVotes(params?: {
  date_from?: string;
  date_to?: string;
  result?: string;
  period_number?: number;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: labrechaKeys.congressVotes(params),
    queryFn: () => congressApi.votes(params),
  });
}

export function useCongressLaws(params?: {
  date_from?: string;
  date_to?: string;
  chamber?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: labrechaKeys.congressLaws(params),
    queryFn: () => congressApi.laws(params),
  });
}

export function useCongressAttendance() {
  return useQuery({
    queryKey: labrechaKeys.congressAttendance,
    queryFn: () => congressApi.attendance(),
  });
}

export function useCongressVote(actaId: string) {
  return useQuery({
    queryKey: labrechaKeys.congressVote(actaId),
    queryFn: () => congressApi.vote(actaId),
    enabled: actaId.length > 0,
  });
}

export function useCongressVoteDetails(actaId: string, params?: { vote?: string; bloc?: string }) {
  return useQuery({
    queryKey: labrechaKeys.congressVoteDetails(actaId, params),
    queryFn: () => congressApi.voteDetails(actaId, params),
    enabled: actaId.length > 0,
  });
}

export function useSenateMembers(params?: { bloc?: string; province?: string }) {
  return useQuery({
    queryKey: labrechaKeys.senateMembers(params),
    queryFn: () => senateApi.members(params),
  });
}

export function useSenateBlocs() {
  return useQuery({ queryKey: labrechaKeys.senateBlocs, queryFn: () => senateApi.blocs() });
}

export function useHolidays(params?: { year?: number; date_from?: string; date_to?: string }) {
  return useQuery({
    queryKey: labrechaKeys.holidays(params),
    queryFn: () => holidaysApi.list(params),
  });
}

export function useNews(params?: {
  source?: string;
  category?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({ queryKey: labrechaKeys.news(params), queryFn: () => newsApi.list(params) });
}

export function useBoletinSummaries(params?: {
  category?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: labrechaKeys.boletin(params),
    queryFn: () => boletinApi.summaries(params),
  });
}

export function useCoparticipacion() {
  return useQuery({
    queryKey: labrechaKeys.coparticipacion,
    queryFn: () => coparticipacionApi.shares(),
  });
}

export function useTaxChanges(params?: {
  change_type?: string;
  jurisdiction?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: labrechaKeys.taxChanges(params),
    queryFn: () => taxesApi.changes(params),
  });
}

export function useScrapeRuns(params?: { limit?: number }) {
  return useQuery({
    queryKey: labrechaKeys.scrapeRuns(params),
    queryFn: () => scrapeRunsApi.list(params),
  });
}

export function useRentByBarrio() {
  return useQuery({
    queryKey: labrechaKeys.rentByBarrio,
    queryFn: () => viviendaApi.rentByBarrio(),
  });
}
