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

Algunos indicadores no encajan en la tabla genérica y usan tablas propias: `congress_votes` +
`congress_vote_details` (votaciones nominales de Diputados). El conector correspondiente sobrescribe
`persist()` para escribir en su esquema, conservando el tracking de `scrape_runs`.

## Fuentes activas

| job | source | indicadores | cadencia sugerida |
|-----|--------|-------------|-------------------|
| `dolar` | dolarapi.com | `dolar_{oficial,blue,mep,ccl,tarjeta,...}` | 15 min |
| `inflacion` | argentinadatos | `ipc_mensual`, `ipc_interanual` | diaria |
| `riesgo_pais` | argentinadatos | `riesgo_pais` (histórico completo) | diaria |
| `series_datosgob` | datos.gob.ar | `cba_nacional`, `ipc_nivel_general`, `reservas_internacionales`, `ripte`, `indice_salarios`, `pobreza_personas`, `base_monetaria`, `recaudacion_tributaria`, `emae` | diaria |
| `reservas_bcra` | BCRA (API v4.0) | `reservas_internacionales` diaria desde 1996 (`source=bcra`) | diaria |
| `congreso` | datos.hcdn.gob.ar | votaciones nominales de Diputados (tablas `congress_votes` / `congress_vote_details`) | semanal |
| `crypto` | CoinGecko | `cripto_{btc,eth,bnb,xrp,ada,sol}` (snapshot diario en USD) | diaria |
| `holidays` | Nager.Date | feriados de Argentina (tabla `holidays`, PK `(date, name)`) | mensual |

`political_events` se puebla con un set curado de hitos (elecciones, cambios de gobierno, DNUs,
medidas económicas) vía `seed-events` — datos curados, no scrapeados. Habilitan anotar las series
en la UI (Fase 3).

`pobreza_personas` es semestral (EPH, total nacional) y se guarda en % (la fuente da fracción).
`reservas_internacionales` tiene dos fuentes bajo el mismo `indicator_code`: la mensual de
datos.gob.ar (`source=datosgobar`) y la diaria del BCRA (`source=bcra`, desde 1996). Es el primer
caso real del comparador de mediciones.

Pendientes: `investments` y `news` (scraper-only, portar del Java) y las fuentes frágiles
(inflación diaria de inflacionverdadera.com, Nowcast pobreza UTDT, ICG/ICC), que van después.

## Agregar un conector

Subclasear `Connector` (definir `name`, `source`, `fetch()`) y registrarlo en `registry.py`. El
tracking de `scrape_runs` lo maneja `run_job`. Para un indicador que encaje en `indicator_history`,
`fetch()` devuelve `list[IndicatorPoint]` y la persistencia default alcanza. Para un esquema propio,
`fetch()` devuelve la estructura que necesite y el conector sobrescribe `persist(session, data)`
(usar `upsert_rows` para upserts idempotentes por lotes).

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

### Vía Docker Compose

El servicio `scraper` está en el `docker-compose.yml` raíz bajo el profile `scraper`, así que no
arranca con `docker compose up` (es un job de cron, no un servicio). Se invoca on-demand y habla con
el servicio `postgres` por la red interna:

```bash
docker compose run --rm scraper status
docker compose run --rm scraper run all
```

Es la forma que usa `crontab.example`.
