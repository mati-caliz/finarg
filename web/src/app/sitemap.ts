import { INDICATOR_META } from "@/lib/indicators";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://labrecha.ar";
  const lastModified = new Date();

  const routes: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "", changeFrequency: "hourly", priority: 1 },
    { path: "/indicators", changeFrequency: "daily", priority: 0.9 },
    { path: "/gaps", changeFrequency: "daily", priority: 0.9 },
    { path: "/congress", changeFrequency: "weekly", priority: 0.8 },
    { path: "/news", changeFrequency: "hourly", priority: 0.6 },
    { path: "/ideas", changeFrequency: "weekly", priority: 0.7 },
    { path: "/holidays", changeFrequency: "monthly", priority: 0.5 },
    { path: "/status", changeFrequency: "daily", priority: 0.4 },
    ...Object.keys(INDICATOR_META).map((code) => ({
      path: `/indicator/${code}`,
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),
    { path: "/calculator-net-salary", changeFrequency: "monthly", priority: 0.7 },
    { path: "/calculator-fiscal-impact", changeFrequency: "monthly", priority: 0.7 },
    { path: "/calculator-compound-interest", changeFrequency: "monthly", priority: 0.6 },
    { path: "/calculator-inflation-adjustment", changeFrequency: "monthly", priority: 0.6 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
