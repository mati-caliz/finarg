# La Brecha — Scraper

App de ingesta (Fase 1 del [ROADMAP](../ROADMAP.md)). Corre por cron, scrapea/consulta fuentes
públicas y escribe indicadores normalizados a PostgreSQL. No expone HTTP: el contrato con la app
web/API es el esquema de la base.

## Modelo de datos

Todos los indicadores nuevos van a una tabla genérica `indicator_history`:

- `indicator_code` — qué es (ej. `dolar_blue`, `ipc_mensual`, `riesgo_pais`, `cba_nacional`).
- `source` — de dónde salió (ej. `dolarapi`, `argentinadatos`, `datosgobar`). Un mismo indicador
  puede tener varias fuentes (ej. pobreza INDEC vs UTDT vs UCA); mostrar la discrepancia es una
  feature, no un bug.
- `date` + `value` + `metadata` (JSONB). Único por `(indicator_code, source, date)` → los jobs son
  idempotentes vía upsert, así que reprocesar no duplica.

`scrape_runs` registra cada corrida (estado, filas, error) para detectar fuentes caídas —
requisito porque los scrapers de HTML/PDF son frágiles y no deben escribir datos dudosos en silencio.

`political_events` guarda hitos (elecciones, DNUs, cambios de ministro) para anotar las series en la UI.

## Fuentes activas

| job | source | indicadores | cadencia sugerida |
|-----|--------|-------------|-------------------|
| `dolar` | dolarapi.com | `dolar_{oficial,blue,mep,ccl,tarjeta,...}` | 15 min |
| `inflacion` | argentinadatos | `ipc_mensual`, `ipc_interanual` | diaria |
| `riesgo_pais` | argentinadatos | `riesgo_pais` (histórico completo) | diaria |
| `series_datosgob` | datos.gob.ar | `cba_nacional`, `ipc_nivel_general`, `reservas_internacionales`, `ripte`, `indice_salarios`, `pobreza_personas` | diaria |

`political_events` se puebla con un set curado de hitos (elecciones, cambios de gobierno, DNUs,
medidas económicas) vía `seed-events` — datos curados, no scrapeados. Habilitan anotar las series
en la UI (Fase 3).

`pobreza_personas` es semestral (EPH, total nacional) y se guarda en % (la fuente da fracción).
`reservas_internacionales` acá es la serie mensual de datos.gob.ar; la diaria del BCRA se sumará
como segunda `source` (`bcra`) bajo el mismo `indicator_code`.

Pendientes: reservas diarias BCRA e índice de salarios, `investments`/`news`/`crypto`/`holidays`
(scraper-only, portar del Java). Fuentes difíciles (inflación diaria de inflacionverdadera.com,
Nowcast pobreza UTDT, ICG/ICC, Congreso) van después.

## Agregar un conector

Subclasear `Connector` (definir `name`, `source`, `fetch() -> list[IndicatorPoint]`) y registrarlo
en `registry.py`. El tracking de `scrape_runs` y el upsert los maneja `run_job`.

## Uso

```bash
python -m labrecha_scraper init-db      # crear tablas
python -m labrecha_scraper list         # jobs disponibles
python -m labrecha_scraper run dolar    # un job
python -m labrecha_scraper run all      # todos
python -m labrecha_scraper seed-events  # sembrar hitos políticos curados
python -m labrecha_scraper status       # última corrida de cada job
```

Configuración por entorno (ver `.env.example`): `DATABASE_URL`, `HTTP_TIMEOUT_SECONDS`,
`HTTP_USER_AGENT`.
