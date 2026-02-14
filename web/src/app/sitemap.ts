import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://finlatamio.com";
  const lastModified = new Date();

  const countries = [
    "ar",
    "argentina",
    "co",
    "colombia",
    "br",
    "brasil",
    "cl",
    "chile",
    "uy",
    "uruguay",
  ];

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "hourly" as const,
      priority: 1,
    },
    ...countries.map((country) => ({
      url: `${baseUrl}/resumen-financiero-${country}`,
      lastModified,
      changeFrequency: "hourly" as const,
      priority: 0.95,
    })),
    {
      url: `${baseUrl}/cotizaciones`,
      lastModified,
      changeFrequency: "hourly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/inflacion`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/reservas-bcra`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bandas-cambiarias`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/comparador-tasas`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/conversor-monedas`,
      lastModified,
      changeFrequency: "hourly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/calculadora-sueldo-neto`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/calculadora-interes-compuesto`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/calculadora-cuotas-contado`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/simulador-de-inversiones`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];
}
