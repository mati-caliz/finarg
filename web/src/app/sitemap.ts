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
    { path: "/cotizaciones", changeFrequency: "hourly", priority: 0.9 },
    { path: "/inflacion", changeFrequency: "daily", priority: 0.85 },
    { path: "/reservas-bcra", changeFrequency: "daily", priority: 0.8 },
    { path: "/riesgo-pais", changeFrequency: "daily", priority: 0.8 },
    { path: "/bandas-cambiarias", changeFrequency: "daily", priority: 0.7 },
    { path: "/comparador-tasas", changeFrequency: "daily", priority: 0.8 },
    { path: "/calculadora-sueldo-neto", changeFrequency: "monthly", priority: 0.7 },
    { path: "/calculadora-interes-compuesto", changeFrequency: "monthly", priority: 0.6 },
    { path: "/calculadora-cuotas-contado", changeFrequency: "monthly", priority: 0.7 },
    { path: "/calculadora-ajuste-inflacion", changeFrequency: "monthly", priority: 0.6 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
