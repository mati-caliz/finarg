import { getRevalidateTime } from "@/lib/cacheRules";

const LEADING_SLASH = /^\//;

export function getBackendUrl(): string {
  return (
    process.env.LABRECHA_API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_LABRECHA_API_URL ||
    "http://localhost:8000"
  );
}

export function buildQueryString(params?: object): string {
  if (!params) {
    return "";
  }
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  }
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

export async function serverGet<T>(path: string, revalidate?: number): Promise<T> {
  const normalized = path.replace(LEADING_SLASH, "");
  const url = `${getBackendUrl()}/${normalized}`;
  const res = await fetch(url, {
    next: { revalidate: revalidate ?? getRevalidateTime(normalized) },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status} for ${path}`);
  }
  return res.json() as Promise<T>;
}
