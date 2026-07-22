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
    { path: "/indicadores", changeFrequency: "daily", priority: 0.9 },
    { path: "/congreso", changeFrequency: "weekly", priority: 0.8 },
    ...Object.keys(INDICATOR_META).map((code) => ({
      path: `/indicador/${code}`,
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),
    { path: "/calculadora-sueldo-neto", changeFrequency: "monthly", priority: 0.7 },
    { path: "/calculadora-impacto-fiscal", changeFrequency: "monthly", priority: 0.7 },
    { path: "/calculadora-interes-compuesto", changeFrequency: "monthly", priority: 0.6 },
    { path: "/calculadora-ajuste-inflacion", changeFrequency: "monthly", priority: 0.6 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
