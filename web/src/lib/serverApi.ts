const LEADING_SLASH = /^\//;

export function getBackendUrl(): string {
  return (
    process.env.LABRECHA_API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_LABRECHA_API_URL ||
    "http://localhost:8000"
  );
}

export async function serverGet<T>(path: string, revalidate = 1800): Promise<T> {
  const url = `${getBackendUrl()}/${path.replace(LEADING_SLASH, "")}`;
  const res = await fetch(url, {
    next: { revalidate },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Backend responded ${res.status} for ${path}`);
  }
  return res.json() as Promise<T>;
}
