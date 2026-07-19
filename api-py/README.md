# La Brecha — API (FastAPI)

API de solo lectura sobre los indicadores que el `scraper/` ingiere a PostgreSQL (Fase 2 del
[ROADMAP](../ROADMAP.md)). Sin estado, sin auth. PostgreSQL es el contrato: esta app define sus
propios modelos de lectura, desacoplados del scraper.

Convive con el backend Java (`api/`) durante la transición; se apaga Spring cuando haya paridad.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Healthcheck. |
| GET | `/indicators` | Lista de indicadores con sus fuentes, cantidad y rango de fechas. |
| GET | `/indicators/{code}` | Serie temporal. Filtros: `source`, `date_from`, `date_to`, `limit`, `order`. |
| GET | `/indicators/{code}/sources` | Fuentes de un indicador con su último valor — base del comparador de mediciones. |
| GET | `/political-events` | Hitos políticos para anotar series. Filtros: `date_from`, `date_to`, `category`. |
| GET | `/congress/votes` | Votaciones de Diputados. Filtros: `date_from`, `date_to`, `result`, `period_number`, `limit`, `offset`. |
| GET | `/congress/votes/{acta_id}` | Cabecera de una votación con su tanteo. |
| GET | `/congress/votes/{acta_id}/details` | Voto por diputado. Filtros: `vote`, `bloc`. |
| GET | `/senate/members` | Composición del Senado. Filtros: `bloc`, `province`. |
| GET | `/senate/blocs` | Composición agregada por bloque. |
| GET | `/holidays` | Feriados. Filtros: `year`, `date_from`, `date_to`. |
| GET | `/news` | Noticias. Filtros: `source`, `category`, `limit`, `offset`. |
| GET | `/scrape-runs` | Última corrida de cada job del scraper (monitoreo). |

Docs interactivas en `/docs` (Swagger) y `/redoc`.

## Uso

```bash
uvicorn labrecha_api.main:app --reload
```

Configuración por entorno (ver `.env.example`): `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`.

## Pendiente (próximos slices de Fase 2)

- Portar las tres calculadoras del Java (sueldo neto, interés compuesto, ajuste por inflación).
- Sumar la app FastAPI al `docker-compose`.
- Evaluar si Redis hace falta sirviendo desde PostgreSQL local.
