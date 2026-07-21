export interface ProvinceCentroid {
  lon: number;
  lat: number;
}

export const PROVINCE_CENTROIDS: Record<string, ProvinceCentroid> = {
  "Buenos Aires": { lon: -60.56, lat: -36.68 },
  CABA: { lon: -58.45, lat: -34.61 },
  Catamarca: { lon: -66.95, lat: -27.34 },
  Córdoba: { lon: -63.8, lat: -32.14 },
  Corrientes: { lon: -57.8, lat: -28.77 },
  Chaco: { lon: -60.77, lat: -26.39 },
  Chubut: { lon: -68.53, lat: -43.79 },
  "Entre Ríos": { lon: -59.2, lat: -32.06 },
  Formosa: { lon: -59.93, lat: -24.9 },
  Jujuy: { lon: -65.76, lat: -23.32 },
  "La Pampa": { lon: -65.45, lat: -37.14 },
  "La Rioja": { lon: -67.18, lat: -29.68 },
  Mendoza: { lon: -68.58, lat: -34.63 },
  Misiones: { lon: -54.65, lat: -26.88 },
  Neuquén: { lon: -70.12, lat: -38.64 },
  "Río Negro": { lon: -67.23, lat: -40.41 },
  Salta: { lon: -64.81, lat: -24.3 },
  "San Juan": { lon: -68.89, lat: -30.87 },
  "San Luis": { lon: -66.03, lat: -33.76 },
  "Santa Cruz": { lon: -69.96, lat: -48.82 },
  "Santa Fe": { lon: -60.95, lat: -30.71 },
  "Santiago del Estero": { lon: -63.25, lat: -27.78 },
  "Tierra del Fuego": { lon: -68.3, lat: -54.0 },
  Tucumán: { lon: -65.36, lat: -26.95 },
};

const LON_MIN = -73.6;
const LON_MAX = -53.6;
const LAT_MIN = -55.2;
const LAT_MAX = -21.8;
const MEAN_LAT_COS = Math.cos((((LAT_MIN + LAT_MAX) / 2) * Math.PI) / 180);

export interface ProjectedPoint {
  x: number;
  y: number;
}

export function projectCentroid(
  centroid: ProvinceCentroid,
  width: number,
  height: number,
): ProjectedPoint {
  const lonSpan = (LON_MAX - LON_MIN) * MEAN_LAT_COS;
  const latSpan = LAT_MAX - LAT_MIN;
  const usableWidth = height * (lonSpan / latSpan);
  const offsetX = (width - usableWidth) / 2;
  const x =
    offsetX + ((centroid.lon - LON_MIN) * MEAN_LAT_COS) / lonSpan * usableWidth;
  const y = ((LAT_MAX - centroid.lat) / latSpan) * height;
  return { x, y };
}
