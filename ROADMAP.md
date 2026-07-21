# Roadmap: de FinArg a plataforma de métricas político-económicas de Argentina

## Visión

Pivotear de un conversor/agregador de cotizaciones a un **observatorio de indicadores
difíciles de conseguir** sobre Argentina: pobreza, inflación de alta frecuencia, reservas,
confianza en el gobierno, actividad del Congreso. El diferencial es doble:

1. Publicar métricas que hoy están dispersas en PDFs, informes de consultoras y portales
   estatales incómodos de usar.
2. Cruzar lo político con lo económico usando el histórico ya acumulado en `quote_history`
   (ej: brecha cambiaria anotada con eventos políticos, inflación por gestión de gobierno).

## Decisiones tomadas (2026-07-17)

- **Nombre**: **La Brecha** (dominio objetivo `labrecha.ar`, aún por registrar en nic.ar).
  Doble sentido: brecha cambiaria (métrica insignia actual) + brecha entre mediciones
  (INDEC vs UTDT vs UCA, oficial vs consultoras), que es la feature distintiva del pivot.
  - User-facing ya renombrado (web, metadata, manifest, README, package.json raíz).
  - El paquete backend `com.finarg` → `com.labrecha` se renombra recién en Fase 2 (se reescribe
    a Python entonces; renombrarlo antes sería trabajo tirado).
- **Backend**: se migra todo a Python/FastAPI. Spring Boot se apaga cuando haya paridad de lectura.
- **Alcance**: solo Argentina. Se eliminan clientes y UI de CO/BR/CL/UY.
- **Auth**: eliminada por completo (JWT, Google OAuth, tabla `users`, alertas). App pública de solo lectura.
- **Monetización por suscripción**: eliminada por completo (Mobbex/payment, subscription,
  UsageTracking, paywalls, límites de cálculo, `/planes`). Se conservan ads (AdSense) y donaciones
  (Cafecito) desacopladas de auth.
- **Módulos "scraper-only"**: `investments`, `news`, `crypto`, `holidays` salen de la UI ahora;
  su lógica de scraping se porta a Python en Fase 1 (dato recolectado a base, sin UI por ahora).
- **Feedback**: eliminado (formulario y backend).
- **Organización**: mismo monorepo, reestructurado en `scraper/` + `api/` + `web/`.

### Hallazgo sobre el código real

El código era mucho más grande que lo que documentaba el `CLAUDE.md` (186 archivos Java, no ~12
controllers): incluía capa de monetización (Mobbex + subscription + usage tracking), módulo
`investments` (bonos, cauciones, cedears, ETFs, letras, metales, acciones), `news`, `crypto`,
`holidays` y `feedback`. El roadmap original no los contemplaba; se decidió su destino arriba.

### Hallazgo sobre la base de datos

El volumen `finarg_postgres_data` estuvo **compartido con otras apps** de la máquina (había tablas
de un restaurante y de una inmobiliaria). Las tablas de este proyecto eran `users`, `alerts`,
`quote_history` y `news_articles`, todas vacías (0 filas).

**Actualización (2026-07-21) — rename a "La Brecha" en prod:** el stack se recreó bajo el proyecto
compose `labrecha` (antes derivaba a `finarg` por el nombre de carpeta). La DB pasó a `labrecha_prod`
sobre un volumen propio y nuevo `labrecha_postgres_data` (ya **no compartido**: el Postgres del stack
es exclusivo de La Brecha). Las 8 tablas viejas de finarg se descartaron por completo y el schema
nuevo lo crea el scraper (`init-db` + seeds + `run all`). Backup de seguridad del `finarg_prod` viejo
en el scratchpad de la sesión (`finarg_prod-backup-2026-07-21.sql`).

## Arquitectura objetivo

```
scraper/   Python: jobs de ingesta por fuente, corridos por cron. Escriben a PostgreSQL.
api/       FastAPI: solo lectura sobre PostgreSQL + calculadoras. Sin estado, sin auth.
web/       Next.js: rediseño con foco en indicadores y series anotadas.
```

PostgreSQL es el contrato entre scraper y api. Sin colas ni mensajería: cron + base compartida.

### Modelo de datos nuevo

Tabla genérica para todos los indicadores nuevos, junto a la `quote_history` existente:

```
indicator_history(id, indicator_code, source, date, value numeric, metadata jsonb)
  índice único (indicator_code, source, date)
scrape_runs(id, job_name, started_at, finished_at, status, rows_upserted, error)
political_events(id, date, title, category, description)   -- para anotar series
```

Un mismo indicador puede tener varias `source` (ej: pobreza INDEC vs UTDT vs UCA):
mostrar la discrepancia entre mediciones es una feature, no un problema.

Lo que no encaja en la tabla genérica usa tablas propias; el conector sobrescribe `persist()`
y sigue registrando en `scrape_runs`. Primer caso: votaciones del Congreso, en
`congress_votes` (cabecera de cada acta) + `congress_vote_details` (voto por diputado).

## Inventario de fuentes por indicador

| Indicador | Fuente | Acceso | Frecuencia | Dificultad |
|---|---|---|---|---|
| Inflación mensual (IPC) | INDEC vía datos.gob.ar / argentinadatos | API JSON | Mensual | Baja (ya resuelto) |
| Inflación diaria | inflacionverdadera.com (PriceStats/MIT) | Scraping HTML/CSV | Diaria | Media |
| Inflación semanal privada | Eco Go, Analytica (informes/prensa), Alphacast repo "SEIDO High Frequency CPI" | Scraping frágil / API Alphacast | Semanal | Alta |
| Pobreza oficial | INDEC (EPH, semestral) vía datos.gob.ar | API/CSV | Semestral | Baja |
| Nowcast de pobreza | UTDT (González-Rozada), mensual | Scraping de informes PDF | Mensual | Alta |
| Pobreza multidimensional | UCA ODSA | PDFs | Trimestral | Alta |
| Canasta básica (CBA/CBT) | INDEC vía datos.gob.ar series | API JSON | Mensual | Baja |
| Salarios (RIPTE, índice de salarios) | datos.gob.ar series | API JSON | Mensual | Baja |
| Reservas BCRA | BCRA API (cliente ya existente, se porta) | API JSON | Diaria | Baja |
| Riesgo país | Fuente actual (se porta) | API | Diaria | Baja |
| Confianza en el gobierno (ICG) | UTDT Escuela de Gobierno | Scraping de informes | Mensual | Media |
| Confianza del consumidor (ICC) | UTDT CIF | Scraping de informes | Mensual | Media |
| Votaciones y composición del Congreso | datos.hcdn.gob.ar, Senado datos abiertos, dataset votaciones-ar (GitHub) | API/CSV | Por sesión | Media |
| Dólar oficial/blue/MEP/CCL | dolarapi (cliente ya existente, se porta) | API JSON | Intradiaria | Baja |
| Resultados electorales | datos.gob.ar (DINE), datacp.ar | CSV | Por elección | Media |

Reglas de ingesta:
- Citar siempre la fuente en la UI (UTDT y Senado lo exigen; con consultoras privadas
  publicar solo el dato agregado ya difundido públicamente, con atribución).
- Todo scraper de PDF/HTML se considera frágil: debe fallar ruidosamente en `scrape_runs`
  y nunca escribir datos dudosos en silencio.

## Fases

### Fase 0 — Poda ✅ COMPLETADA (2026-07-17)

Achicar la superficie antes de construir lo nuevo. La app quedó funcionando en cada paso.

Backend (Java, se elimina para siempre): `auth`, `user`, `alerts`, `payment`, `subscription`,
`feedback`, filtros JWT, `PasswordEncoderConfig`, `SecurityConfigValidator`. `SecurityConfig`
reescrito a permit-all conservando CORS + rate limiting. Clientes multi-país (brazil/chile/
colombia/uruguay) y `ExchangerateApiClient` + conversor de monedas eliminados; cross-quotes
(BRL/CNY/PYG/BOB) sacados de `ArgentinaQuoteClient`. Config muerta (jwt/google/mobbex/feedback)
removida de los `application*.yml`. Compila con `mvn clean compile`.

Frontend (poda de UI): eliminadas páginas `/login`, `/planes`, `/conversor-monedas`,
`/comparador-tipos-cambio`, `/inversiones`, `/feriados`, `/noticias-financieras-argentina`,
`resumen-financiero-[pais]`. Eliminado todo el sistema premium/paywall de raíz (no `isPremium`
hardcodeado): `Paywall`, `UsageBadge`, `UpgradeBannerWrapper`, `InvestmentsPremiumModal`,
`PremiumUpsellCard`, límites de cálculo, `premium` en `ChartPeriod`. `useAuthStore` eliminado;
`useAppStore` conserva `selectedCountry` fijo en "ar" (se saca el selector de la UI). Módulos api
muertos removidos de `lib/api.ts` + interceptor de 401. Verificado con `tsc --noEmit`, `biome check`
y `next build` (rutas resultantes: solo home, indicadores, calculadoras y comparador-tasas).

Módulos scraper-only (`investments`, `news`, `crypto`, `holidays`): sacados de la UI; su backend
Java queda como **referencia para portar a Python en Fase 1**.

Tests: los que fallan son pre-existentes (verificado con git stash); se borró solo el test de
`useAuthStore` que probaba código eliminado.

**Criterio de salida**: ✅ la app compila, funciona solo-Argentina, sin login, `next build` OK.

### Fase 1 — Scraper Python (≈2-3 semanas, el corazón del pivot) — 🚧 EN CURSO

**Hecho (2026-07-17):** estructura `scraper/` creada (SQLAlchemy + httpx + pydantic, un job =
un módulo), tablas `indicator_history` / `scrape_runs` / `political_events`, connector base con
tracking de corridas y upsert idempotente, CLI (`init-db`/`list`/`run`/`seed-events`/`status`),
Dockerfile + crontab de ejemplo. Conectores verificados end-to-end contra Postgres (re-run
idempotente):
- `dolar` (dolarapi): oficial/blue/MEP/CCL/tarjeta/cripto/mayorista.
- `inflacion` (argentinadatos): `ipc_mensual` + `ipc_interanual` (desde 1943).
- `riesgo_pais` (argentinadatos): histórico desde 1999.
- `series_datosgob` (datos.gob.ar): `cba_nacional`, `ipc_nivel_general`, `reservas_internacionales`
  (mensual), `ripte`, `indice_salarios`, `pobreza_personas` (total nacional, semestral, en %),
  `base_monetaria`, `recaudacion_tributaria`, `emae`, `desempleo` (EPH, trimestral, en %),
  `expectativas_inflacion_rem` (REM mediana 12m, mensual). → ~13k filas históricas.
- `reservas_bcra` (BCRA API v4.0, variable 1): `reservas_internacionales` **diaria** desde 1996
  (~7.5k filas, source `bcra`). Convive con la mensual de datosgobar bajo el mismo `indicator_code`:
  dos `source` para el mismo indicador, primer caso del comparador de mediciones.
- `seed-events`: 19 hitos políticos curados 2001-2024 en `political_events` (para anotar series).
- `congreso` (datos.hcdn.gob.ar): votaciones nominales de Diputados en tablas propias
  (`congress_votes` 999 actas 2011-2020 + `congress_vote_details` ~257k votos por diputado).
  Recursos resueltos dinámicamente vía la API CKAN (clasificados por formato JSON + keyword
  cabecera/detalle): al agregarse un período nuevo entra solo, sin URLs hardcodeadas.
- `crypto` (CoinGecko): `cripto_{btc,eth,bnb,xrp,ada,sol}` como snapshot diario en USD
  (portado del scraper-only Java).
- `holidays` (Nager.Date): feriados de Argentina 2010-2027 en tabla propia `holidays`
  con PK `(date, name)` — la fuente tiene días con dos feriados (portado del scraper-only Java).
- `news` (El Economista RSS): ingesta cruda de artículos a `news_articles` (idempotente por
  `source_url`, sin resumen AI ni clasificación de categoría). Sumar feeds = una entrada en `FEEDS`.
- `senado` (Senado datos abiertos): composición actual del Senado (72 senadores) en tabla propia
  `senators` (bloque, provincia, partido, mandato). Export JSON oficial. Las votaciones del Senado
  se descartaron por ahora (sólo HTML frágil en `/votaciones/actas`, sin JSON/CSV).

Fuentes frágiles descartadas: inflacionverdadera.com (página estática, data como imagen) y el
Nowcast de pobreza de UTDT (app Shiny en shinyapps.io, sin CSV/JSON legible).

**ICG (confianza en el gobierno) HECHO (2026-07-19):** conector `icg` (source `utdt`,
indicator_code `confianza_gobierno`, escala 0-5). La página del ICG de UTDT no da Excel/CSV (los ZIP
son PDFs mensuales), PERO el texto de la página trae el archivo narrativo mensual ("El ICG de junio
fue de 2,07 puntos…"): se scrapea con regex y se reconstruyen las fechas caminando hacia atrás desde
el mes ancla, verificando contra los meses nombrados (falla ruidosa si el HTML cambia). 31 meses
(2023-12→2026-06) upserted y verificados vía la API; cableado a la Home + su página de indicador.

**Pendiente:** el resto de las fuentes frágiles — inflación de alta frecuencia (Alphacast requiere
API key; consultoras sólo prensa) y Nowcast de pobreza UTDT (app Shiny, sin datos legibles). El ICC
(confianza del consumidor, UTDT CIF) probablemente se pueda con el mismo patrón que el ICG. El resto
(fuentes de dificultad baja/media, módulos scraper-only, Senado, compose) está hecho.

El `scraper` ya está integrado al `docker-compose.yml` (servicio bajo profile `scraper`, se corre
on-demand con `docker compose run --rm scraper <job>`; habla con `postgres` por la red interna).

- Orden de conectores, de menor a mayor riesgo:
  1. ✅ Los de dificultad baja portados del Java (datos.gob.ar, BCRA, dolarapi, riesgo país):
     validan la arquitectura con fuentes conocidas.
  2. ✅ CBA/CBT, RIPTE, índice de salarios, pobreza oficial INDEC.
  3. ✅ Congreso Diputados (datos.hcdn.gob.ar, API CKAN — más accesible de lo previsto).
  4. inflacionverdadera.com (inflación diaria).
  5. ICG/ICC de UTDT y Nowcast de pobreza UTDT (PDFs — el más difícil, hacerlo al final
     con lo demás ya andando).
  6. ✅ Senado: composición actual (datos abiertos, JSON oficial). Votaciones del Senado
     descartadas (sólo HTML frágil).
  7. Portar los módulos scraper-only que quedaron en Java como referencia: ✅ `crypto`,
     ✅ `holidays`, ✅ `news`. `investments` (bonos, cauciones, cedears, ETFs, letras, acciones)
     se descarta: sin fuente gratis viable (dolarito tras Cloudflare 403, Finnhub requiere key,
     bonos hardcodeados, metales eliminado). `metales` eliminado del backend a pedido.
- Scheduling con cron del host (una entrada por cadencia: 15min cotizaciones, diaria,
  semanal, mensual). Idempotencia por upsert sobre el índice único.
- Backfill histórico de cada serie hasta donde la fuente lo permita.

**Criterio de salida**: `scrape_runs` muestra corridas verdes de todas las fuentes de
dificultad baja/media, y al menos pobreza + inflación diaria pobladas con histórico.

### Fase 2 — API FastAPI (≈1-2 semanas) — ✅ COMPLETADA (backend nuevo listo)

**Hecho:** app FastAPI en `api-py/` (modelos de lectura propios, desacoplados del scraper).
Endpoints genéricos verificados contra la base: `/indicators` (catálogo con fuentes y rangos),
`/indicators/{code}` (serie con filtros `source`/`date_from`/`date_to`/`limit`/`order`),
`/indicators/{code}/sources` (comparador de mediciones — ej. reservas bcra vs datosgobar),
`/political-events` y `/scrape-runs` (monitoreo). `/health` + docs en `/docs`.
Endpoints de las tablas propias: `/congress/votes` (+ `/{acta_id}` y `/details`),
`/senate/members` + `/senate/blocs`, `/holidays`, `/news`. Todos verificados contra la base.

Las tres calculadoras portadas: `/calculators/compound-interest`, `/calculators/inflation-adjustment`
(ajuste por IPC sobre `ipc_mensual`) e `/calculators/income-tax` (sueldo neto, Impuesto a las
Ganancias: deducciones legales con efecto aguinaldo, cargas de familia, deducciones personales y
escala progresiva). Verificadas: 100k al 10% anual → 110k; inflación 2024 → 117,68% (≈ INDEC);
Ganancias con consistencia interna (suma de tramos = impuesto anual, bases = neto imponible).

La app FastAPI ya está en el `docker-compose` (servicio `api-py`, publicado en `127.0.0.1:8000`,
con healthcheck sobre `/health`; habla con `postgres` por la red interna). Verificada corriendo en
contenedor (healthy, sirviendo indicadores y calculadoras).

**Redis eliminado.** La FastAPI sirve directo desde PostgreSQL local y no lo usa; Bucket4j (rate
limiting del Java) es en memoria. Se sacó el servicio `redis` de ambos compose (dev y prod), la
dependencia `spring-boot-starter-data-redis`, `RedisConfig`, la config `spring.data.redis`/
`spring.cache.type=redis` de los `application*.yml` y las env `REDIS_*`. El backend Java sigue
andando con caché en memoria (`spring.cache.type=simple` → `ConcurrentMapCacheManager`); compila OK.

**Cierre:** el backend nuevo (FastAPI) está completo, en el compose y sin Redis. Lo único que resta
para apagar Spring es apuntar `web/` a la nueva API — eso es la Fase 3 (rediseño de frontend), donde
además se borra el módulo Java y su Dockerfile. Hasta entonces conviven, ya sin Redis.

### Fase 3 — Rediseño frontend + nombre (≈2-3 semanas) — 🚧 EN CURSO

**Hecho (2026-07-19) — fundamento de diseño + Home:** se adoptó el "La Brecha Design System"
(Claude Design, dirección "Observatorio claro"). Tokens portados a `web/src/app/globals.css`
(paleta papel/tinta, azul institucional, semánticos alza/baja/**brecha ámbar**/evento violeta,
tipografía Archivo + IBM Plex Mono vía `next/font`, espaciado, sombras). Tema unificado bajo
`[data-theme]` (next-themes + Tailwind `darkMode` a `data-theme`). Componentes core portados 1:1
como TSX tipados en `web/src/components/core/` (IndicatorTile, Sparkline, VariationBadge,
SourceChip/SourceAttribution, Card, Badge, Button, Tabs/RangeSelector, DataTable, EventDot, VoteBar/
VoteCard, AnnotatedSeriesChart con relleno de brecha + eventos). Home reescrita como
"Estado del país": grilla de tiles conectados a la FastAPI (`useLabrecha`/`labrechaApi`) con
último valor, variación (pct o pp según indicador), sparkline y atribución de fuente+fecha, más la
card estrella del comparador de mediciones (reservas BCRA vs datos.gob.ar, brecha en USD y %).
Verificado: `tsc`, `biome check` y `next build` en verde; Home sirve el shell con datos reales.

**Hecho (2026-07-19) — página por indicador:** ruta dinámica `/indicador/[code]` con header
(valor/variación/atribución), `RangeSelector`, serie anotada con `political_events` vía
`AnnotatedSeriesChart`, y —cuando el indicador tiene ≥2 fuentes— el **comparador**: series alineadas
en un eje común (union + resample carry-forward/back-fill, downsample a ≤400 puntos), relleno de
brecha ámbar, tabla de discrepancia (último valor + brecha vs fuente primaria) y metodología por
fuente. Helpers puros en `lib/series.ts` (alineación, eventos→índices, rangos) testeados; hook
`useIndicatorSeriesMulti` (useQueries) para traer una serie por fuente. Verificado: `tsc`/`biome`/
`next build` verdes, rutas `/indicador/reservas_internacionales` y `/indicador/riesgo_pais` 200 OK.

**Hecho (2026-07-19) — sección Congreso:** `/congreso` con composición del Senado (barra apilada
por bloque + mayoría marcada, sobre `/senate/blocs`, 72 bancas) y grilla de últimas votaciones de
Diputados (`VoteCard` sobre `/congress/votes`). Detalle en `/congreso/votacion/[actaId]`: cabecera
con tanteo (`VoteBar`) + resultado, y **voto por bloque** agregando `/congress/votes/{id}/details`
(`tallyByBloc` en `lib/congress.ts`). Verificado `tsc`/`biome`/`next build`, rutas 200 OK.

**Hecho (2026-07-19) — navegación + primera calculadora:** Sidebar y Navbar reescritos sobre el
design system (sidebar claro "Observatorio claro", marca "La Brecha" con barra ámbar, IA nueva:
Inicio · Indicadores → `/indicador/[code]` · Congreso · Calculadoras), shell entero en fondo papel
(`--bg-page`). Se sacaron selector de país, feature-gating y traducciones muertas. Calculadora de
**interés compuesto** reescrita como página autocontenida sobre la FastAPI (`/calculators/
compound-interest`) con componentes core (form + resumen + `DataTable`); cálculo verificado
(100k @10% 1 año → 110.000). `next build` verde.

**Hecho (2026-07-19) — calculadoras nuevas + poda de lo viejo:** sueldo neto (`/calculators/
income-tax`) y ajuste por inflación (`/calculators/inflation-adjustment`) reescritas sobre la FastAPI
con componentes core (verificadas contra la API). "Cuotas vs contado" removida (sin endpoint en la
FastAPI). Retiradas todas las páginas/rutas viejas que pegaban a la API Spring (`/cotizaciones`,
`/inflacion`, `/reservas-bcra`, `/riesgo-pais`, `/bandas-cambiarias`, `/comparador-tasas`) y su código
huérfano: `components/{dashboard,quotes,comparison,converter,indicators,charts,calculators}`, hooks
`use{Quotes,Reserves,Inflation,CountryRisk,SocialIndicators,Governments}`, `lib/api.ts`,
`UpgradeBanner`, `GoogleOAuthWrapper` y sus tests. `sitemap.ts` apunta a la IA nueva (indicadores +
congreso). La app ahora expone SÓLO rutas del stack nuevo (FastAPI). `tsc`/`biome` (78 archivos)/
`next build` verdes; los 5 tests que fallan son pre-existentes (ErrorBoundary/Button/Card/QueryError/
test-utils, componentes no tocados).

**Hecho:** el backend Java (`com.finarg`) se retiró por completo — ya no queda módulo Java en el repo
(stack nuevo Python `labrecha_*`). Menores pendientes: `config/countries` quedó sólo por
`store`/`queryKeys`/`types` (simplificable a Argentina fija), y limpiar traducciones/`i18n` muertas.

- Nueva arquitectura de información. Home = "estado del país" con:
  - Inflación: oficial mensual + curva diaria/semanal privada en el mismo gráfico.
  - Pobreza: INDEC vs Nowcast UTDT vs UCA (el comparador de mediciones como widget estrella).
  - Reservas, riesgo país, ICG, dólares principales.
- Series temporales anotadas con `political_events` (elecciones, DNUs relevantes, cambios
  de ministros): es la feature distintiva del pivot.
- Sección Congreso: composición, últimas votaciones relevantes.
- Página por indicador con metodología, fuente y disclaimer de cada medición.
- Nombre ya elegido (**La Brecha**); en esta fase se completa el rename del backend
  (`com.finarg` → `com.labrecha`) al reescribirlo en Python, y se registra/apunta `labrecha.ar`.

**Criterio de salida**: UI nueva desplegable, sin rastros de "FinArg" ni de features podadas.

### Fase 4 — Infra y lanzamiento (≈1 semana) — 🚧 EN CURSO

**Hecho (2026-07-19) — wiring del frontend nuevo a la FastAPI (patrón BFF):** el front pega
same-origin a `/api/data/...` y el route handler `web/src/app/api/data/[...path]/route.ts` proxya a
la FastAPI (`LABRECHA_API_INTERNAL_URL`, default api-py:8000) con **caché ISR por ruta** (GET) y
reenvío de POST (calculadoras). Escalable para lectura alta, sin exponer api-py ni tocar el nginx
compartido (la ruta `/api/data/`→frontend ya existe). Se quitó el rewrite viejo de `next.config.js`
que apuntaba al Java, se sacó el backend del CSP `connect-src`, y los redirects viejos se
repuntaron a las rutas nuevas (`/reservas`,`/reservas-bcra`→`/indicador/reservas_internacionales`,
`/cotizaciones`→`/indicador/dolar_blue`, `/inflacion`→`/indicador/ipc_mensual`,
`/riesgo-pais`→`/indicador/riesgo_pais`). Compose dev y prod: agregado servicio `api-py` (prod no lo
tenía) + `frontend` apunta a `http://api-py:8000` y depende de él. Verificado end-to-end (GET cacheado
+ POST) y ambos compose parsean.

**Hecho (2026-07-19) — Spring apagado:** retirado el backend Java de forma coordinada. Borrado el
módulo `api/` completo; sacado el servicio `backend` de ambos compose (y de `depends_on` del nginx
prod); en `nginx/nginx.conf` (compartido) removidos —quirúrgicamente— el `upstream backend` y las
locations `/api/` + `/actuator/health` del server de finlatamio, dejando intactos los otros sitios
(gastronova/portfolio/jobhunter; llaves balanceadas 30/30, 8 `server_name` intactos). CI (`ci.yml`):
reemplazado el job Maven/Java por un `python-check` (byte-compile de `api-py`) + type-check del front;
filtros y summary actualizados. Verificado: compose dev/prod parsean, `ci.yml` es YAML válido,
`compileall labrecha_api` OK, `next build` verde. La app corre 100% sobre el stack nuevo
(FastAPI + scraper Python), sin rastros de Spring.

**Hecho (2026-07-19) — infra/calidad sin-server:** `scraper` agregado al compose de prod (profile
on-demand, hardening). CI de Python ampliado: corre `ruff` (lint) sobre `api-py` + `scraper` además
del byte-compile (config en `ruff.toml`). README/CLAUDE.md/scripts ya actualizados (ver más arriba).

**Hecho (2026-07-21) — cron del scraper + Boletin con IA en prod:** cron del host (`crontab` del
usuario `deploy`, TZ=UTC) vía `scripts/scrape-cron.sh`: cotizaciones (`dolar`/`crypto`/`riesgo_pais`)
cada 15 min y `run all` diario 07:20. El conector `boletin_oficial` usa el **CLI `claude` headless**
(no API key — la **suscripcion** del usuario `deploy`): el servicio `scraper` bind-montea el binario
nativo (`~/.local/bin/claude`) + credenciales (`~/.claude`, `~/.claude.json`) dentro del contenedor.
Gotcha: `cap_drop: ALL` rompe el login del CLI (queda "Not logged in") — se quito del servicio
`scraper` (se conservan `no-new-privileges` + limite de RAM + tmpfs). El scraper necesita `app-network`
ademas de `db-network` para tener salida a internet (sin eso, todos los jobs fallan con DNS).

**Pendiente Fase 4 — requiere el server (no hacer sin acceso al VPS):** registrar/apuntar
`labrecha.ar` (DNS), monitoreo/alerta sobre `scrape_runs`, y renombrar la carpeta de deploy del VPS
(`/home/deploy/finarg` en deploy.yml/force-rebuild.yml) si se decide. La carpeta root (local y VPS) sigue `finarg` (renombrar con `mv` desde afuera de la sesión).
La DB y el proyecto compose de prod **ya se renombraron a `labrecha`** (2026-07-21): proyecto
`labrecha`, DB `labrecha_prod`, volumen `labrecha_postgres_data` propio.

### Fase 4 — Infra y lanzamiento (detalle original)

- `docker-compose` final: postgres + api (FastAPI) + web + cron del scraper
  (contenedor con crond o cron del host invocando `docker compose run scraper <job>`).
- Adaptar workflows de CI (`ci.yml`, `security.yml`, `deploy.yml`) al stack Python.
- Monitoreo mínimo: healthcheck de la API + alerta simple (mail/Telegram) cuando un
  job de `scrape_runs` falla N veces seguidas.
- Dominio nuevo, redirect desde el viejo si existía, y actualización de CLAUDE.md/README.

## Riesgos principales

- **Fragilidad de fuentes no-API** (UTDT, UCA, consultoras): mitigado con `scrape_runs`,
  fallos ruidosos y diseño donde un indicador sin dato fresco muestra el último valor
  con su fecha, nunca rompe la página.
- **Derechos de datos de consultoras privadas**: publicar solo cifras ya difundidas
  públicamente y siempre con atribución; ante la duda, dejar la fuente afuera.
- **Migración FastAPI más larga de lo esperado**: la Fase 1 no depende de ella; si se
  atrasa, Spring puede convivir leyendo `indicator_history` como plan B temporal.

### Fase 5 — Features de engagement (métricas "que se mueven") — 🔜 PLANIFICADA (2026-07-19)

Con la plataforma andando (scraper + FastAPI + BFF) y `indicator_history` como tabla genérica,
sumar indicadores nuevos es barato. Esta fase apila **features de enganche**: contadores en vivo,
progress bars políticos, calculadoras personales y un pipeline de IA sobre el Boletín Oficial.

**Principios que no cambian** (heredados del resto del roadmap):
- Ningún número sin **fuente + fecha** visibles. Los contadores "en vivo" son *proyecciones*: se
  rotula explícito "proyección sobre el último dato oficial de \<fuente\> (\<fecha\>)".
- Preferir fuentes con API sobre scraping frágil. Fuente sin API viable → research spike, no se
  promete en la UI hasta tener el dato verde en `scrape_runs`.
- Reusar `indicator_history` + los indicadores ya ingeridos antes de crear tablas nuevas.

#### Veredicto de factibilidad por feature

| Feature | Dato nuevo | Fuente candidata | Encaje | Veredicto |
|---|---|---|---|---|
| Contadores dinámicos (clocks) | Ninguno | Series ya ingeridas + tasa derivada | Frontend puro | 🟢 Quick win |
| Monitor BCRA (base + tasa política) | Tasa de política monetaria | BCRA API (`base_monetaria` ya está) | `indicator_history` | 🟢 Fácil |
| Promesómetro fiscal (emisión vs meta / resultado) | Resultado fiscal mensual | Sec. Hacienda (datos.gob.ar) | `indicator_history` | 🟢 Fácil |
| Gasto público por segundo | Presupuesto anual vigente | Presupuesto Abierto / Sec. Hacienda | Constante + clock | 🟢 Fácil |
| Calculadora impacto fiscal (IVA/Ganancias/IIBB) | Ninguno (alícuotas) | Extiende `/calculators/income-tax` | Calculadora nueva | 🟢 Fácil |
| Tax Freedom Day / días para el Estado | Ninguno | Deriva de impacto fiscal | Calculadora | 🟢 Fácil |
| Termómetro del empleo (privado/público/informal) | Empleo por categoría | SIPA / EPH vía datos.gob.ar | `indicator_history` (3 codes) | 🟡 Media |
| Radar de crédito (tasas, morosidad) | Tasas activas, irregularidad de cartera | BCRA API | `indicator_history` | 🟡 Media |
| Coparticipación por provincia | Envíos y aportes por provincia | Min. Economía / datos.gob.ar | Tabla propia + mapa | 🟡 Media |
| Congresómetro (tracker de leyes) | Estado de trámite de proyectos | HCDN/Senado trámite parlamentario | Tabla propia | 🟡 Media |
| Boletín Oficial con IA + Impuestómetro | Resúmenes + count de impuestos | boletinoficial.gob.ar + LLM | Tabla propia + pipeline IA | 🟠 Alta |
| Monitor de vivienda (m2/alquileres CABA) | Precios inmobiliarios | Zonaprop/Argenprop (Cloudflare), Prop. index | Research spike | 🔴 Data-hard |
| Termómetro de subsidios (luz/gas/transporte) | Costo real vs subsidiado | ASAP / Sec. Energía (disperso) | Research spike | 🔴 Data-hard |

#### Sub-fases (de menor a mayor riesgo)

**5.a — Contadores y monitores sobre datos existentes (frontend + poco scraper).** 🚧 EN CURSO.
**Hecho (2026-07-19):** componente core `LiveCounter` (`web/src/components/core/LiveCounter.tsx`) que
anima con `requestAnimationFrame` (y cae a intervalo de 1s bajo `prefers-reduced-motion`), sin
mismatch de hidratación (arranca en el valor base y tickea en efecto) y sólo re-renderiza al cambiar
el string formateado. Helpers puros en `web/src/lib/liveCounter.ts` (`projectedValue`,
`startOfCurrentMonth`, `daysInMonth`, `monthlyRateToPerSecond`) con 9 tests. Primer contador:
**Inflación clock** (`InflationClockCard` en la Home) que proyecta linealmente el último `ipc_mensual`
oficial sobre los días del mes, con badge "Proyección", fuente+fecha y disclaimer de que no es una
medición.

**Hecho (2026-07-19) — Monitor BCRA:** se registraron en el scraper dos connectors que estaban escritos
pero sin registrar (`bcra_tasas` → `tasa_tamar` + `tasa_plazo_fijo`, TNA % diaria desde 2004 vía BCRA
API v4.0; y `big_mac` → índice Big Mac de Argentina, The Economist). Corridos verdes (`bcra_tasas` 5948
filas, `big_mac` 129). Card `MonitorBcraCard` en la Home: base monetaria (ya ingerida, formateada en
billones con variación mensual, "emisión cero" = baja es buena) + tasa de referencia (TAMAR) + plazo
fijo minorista, cada una con fuente+fecha. **Hallazgo:** la variable BCRA "Tasa de política monetaria"
(id 160) quedó **discontinuada en 2025-07** al cambiar el esquema monetario; la referencia viva hoy es
TAMAR (id 44), que es la que se muestra. Verificado `tsc`/`biome`/`next build` + `compileall`/`ruff`
verdes. **Pendiente 5.a:** Base monetaria clock (contador en vivo), Gasto público por segundo (falta
ingerir el presupuesto anual).
Componente `LiveCounter` genérico: recibe valor base + fecha + tasa (diaria/horaria/por-segundo derivada del
último informe) y anima con `requestAnimationFrame`, con rótulo de proyección y fuente. Aplicaciones:
*Inflación clock* (proyecta el IPC del mes desde el último mensual/REM), *Deuda/Base monetaria clock*,
*Gasto público por segundo* (presupuesto anual / segundos del año). **Monitor BCRA**: tile combinado
base monetaria (ya ingerida) + tasa de política monetaria (connector `tasas_bcra` nuevo sobre BCRA
API). Criterio de salida: contadores en Home con disclaimer de proyección; `scrape_runs` verde para
`tasas_bcra`.

**5.b — Calculadoras personales.** ✅ HECHO (2026-07-19). Endpoint `/calculators/tax-impact`
(`api-py/labrecha_api/tax_impact.py`): sueldo bruto + gastos mensuales → desglose anual/mensual de
Impuesto a las Ganancias (reusa `calculate_income_tax`), IVA embebido (21% sobre el gasto), Ingresos
Brutos (alícuota provincial representativa 4%, declarada) y aportes de seguridad social, con % de cada
uno sobre el ingreso. Incluye el **Tax Freedom Day**: presión total, "días trabajando para el Estado"
y fecha de liberación en el año. Verificado: suma de ítems == total (consistencia interna), 200 con
payload correcto y 422 ante input inválido, tanto en local (uvicorn) como en el contenedor. UI en
`/calculadora-impacto-fiscal` (form + card con la fecha de liberación destacada en ámbar + `DataTable`
del desglose), sumada al Sidebar y al sitemap. Disclaimer explícito de supuestos (IVA 21%, IIBB 4%
representativo, aportes ≠ impuestos, sin internos ni tasas municipales). `tsc`/`biome`/`next build` +
`compileall`/`ruff` verdes.

**5.c — Progress bars políticos.** 🚧 EN CURSO. **Hecho (2026-07-19) — Promesómetro fiscal:** dos series
nuevas en `series_datosgob` (`resultado_primario` = IMIG `452.3...`; `resultado_financiero` mensual base
caja `378.9...`, ambas de Secretaría de Hacienda vía datos.gob.ar, en ARS millones, hasta 2026-05).
Corrida verde. Widget `PromesometroFiscalCard` en la Home: en vez de inventar una meta numérica, mide la
promesa real del gobierno ("superávit financiero") como **racha de meses consecutivos con resultado
financiero > 0** (hoy 4 meses, feb–may 2026, cortados por el déficit estacional de enero), con tira de
los últimos 12 meses (verde superávit / rojo déficit) y los resultados financiero + primario del mes en
billones con signo y color. Fuente+fecha visibles. Verificado `tsc`/`biome`/`next build` +
`ruff`/`compileall` verdes. **Pendiente 5.c:** *Termómetro del empleo* (connector `empleo_sipa`, 3
`indicator_code` formal privado / público / informal, barra apilada 100%) — requiere research de la
fuente (SIPA para registrados + EPH para informalidad; el split 3-vías mensual no es una serie directa).
Criterio de salida: `scrape_runs` verde para ambos connectors; widgets con fuente + fecha.

**Hecho (2026-07-19) — Termómetro del empleo:** 7 series nuevas en `series_datosgob`. Composición del
empleo **registrado** (SIPA, sin estacionalidad, mensual hasta 2026-03, en miles de personas):
`empleo_asalariado_privado`, `empleo_asalariado_publico`, `empleo_independiente_autonomo`,
`empleo_independiente_monotributo`, `empleo_independiente_monotributo_social`,
`empleo_casas_particulares`. Y la fuente de "en negro" que faltaba: `empleo_no_registrado` =
**tasa de asalariados sin descuento jubilatorio** (EPH INDEC, `52.2_ASDJ...`, trimestral, factor 100).
Widget `TermometroEmpleoCard` en la Home: barra apilada 100% de 4 segmentos (privado 48% / público 26% /
independientes 22% / casas particulares 3%, total 12,8M registrados) con leyenda (millones + %), más un
callout aparte con el empleo no registrado (37,9%). **Decisión de honestidad:** el "en negro" (EPH, base
de medición distinta a SIPA) se muestra **fuera** de la barra de registrados, con disclaimer, en vez de
mezclar bases inconsistentes. Verificado `tsc`/`biome`/`next build` + `ruff`/`compileall` verdes.
**5.c COMPLETA.**

**5.d — Radar de crédito + Coparticipación (mapa).** 🚧 EN CURSO. **Hecho (2026-07-19) — Radar de
crédito:** connector `credito_bcra` (BCRA API v4.0, unidad por variable) → `tasa_prestamos_personales`
(var 144, 64,8% TNA), `tasa_adelantos_cuenta_corriente` (var 13, 25,6% TNA) y `prestamos_sector_privado`
(var 117, stock ~$101 billones, diario). Corrida verde (13.687 filas). Widget `RadarCreditoCard` en la
Home: dos tiles de tasas activas + el stock de crédito al sector privado en billones con variación
nominal ~30 días (rotulada nominal). **Hallazgo:** la morosidad/irregularidad de cartera **no está en la
API monetarias** del BCRA (vive en el "Informe sobre Bancos", fuente frágil) → queda pendiente y así se
dice en el disclaimer del widget. Verificado `tsc`/`biome`/`next build` + `ruff`/`compileall` verdes.
**Hecho (2026-07-21) — Coparticipación:** el desglose **mensual** por provincia no existe como serie/CSV
limpia (solo agregados nacionales; el detalle vive en Excels de la DNAP). Se pivoteó a la **distribución
secundaria de la Ley 23.548** — el reparto estructural por ley, dato fijo y citable: coeficientes
exactos extraídos del PDF de la **Comisión Federal de Impuestos** (columna "Coparticipación Federal
Ley 23548", vigencia estable). Comando CLI `seed-coparticipacion` (`seed_coparticipacion.py`) siembra 24
jurisdicciones en tabla propia `coparticipacion_shares` (suma 0,6111 = total provincias+CABA, verificado
contra la fuente). Endpoint `/coparticipacion` (calcula el % del reparto = coef/total) + modelo/schema.
Widget `CoparticipacionCard` en la Home: **ranking de barras** de las 24 provincias por su tajada del
reparto (Buenos Aires 20,4% · Santa Fe 8,3% · Córdoba 8,25% …), con atribución CFI + Ley 23.548 y
aclaración de que es el reparto por ley, no las transferencias efectivas del mes.

**Hecho (2026-07-21) — mapa:** se sumó el **mapa** que pedía el feature, como **mapa de burbujas con
centroides reales** (de georef del Estado, embebidos en `lib/argentina.ts` con proyección equirectangular
corregida por cos(lat); Tierra del Fuego ajustada a su centroide continental para no arrastrar la
Antártida). Cada provincia es una burbuja posicionada por su coordenada real y dimensionada por su tajada
del reparto, con tooltip y etiqueta en las grandes; al lado, el ranking de barras (accesible). Se eligió
burbujas sobre un choropleth de polígonos porque no había paths precisos de las 24 provincias y dibujarlos
a mano sería inexacto — las burbujas usan coordenadas verdaderas, sin geometría inventada. Helper de
proyección puro con 4 tests (N arriba de S, O a la izquierda de E, dentro del viewport). **5.d COMPLETA**
(radar + coparticipación con mapa).
*Radar de crédito (versión original)*: connector `credito_bcra`
(tasas activas promedio + irregularidad de cartera, BCRA API). *Coparticipación*: connector
`coparticipacion` (Min. Economía) a tabla propia `coparticipacion(provincia, date, enviado, aportado,
metadata)`; componente `ArgentinaMap` (SVG de provincias, sin librería externa de mapas para respetar
el CSP de assets self-contained) coloreado por saldo neto envío-aporte. Research spike previo para
confirmar granularidad y disponibilidad de "lo que aporta cada provincia". Criterio de salida: mapa
interactivo con tooltip fuente+fecha; connectors verdes.

**5.e — Congresómetro (tracker de leyes).** ✅ HECHO (2026-07-20). Vertical completo: tabla propia
`sanctioned_laws` (número de ley PK, cámara sancionadora, expediente, fechas de 1ª/2ª media sanción y
sanción definitiva, título, sumario) + connector `leyes` (HCDN CKAN: cruza `leyes-sancionadas` con
`proyectos-parlamentarios` para el título por `PROYECTO_ID` y `leyes-sumario` para el sumario, dedup por
número de ley, normaliza el BOM embebido en las claves del JSON). Corrida verde: 1337 leyes, 500/500
recientes con título. Endpoint `/congress/laws` (filtros date_from/date_to/chamber, orden por sanción
definitiva desc) + modelo/schema de lectura. Frontend: panel "Últimas leyes sancionadas" en `/congreso`
(`RecentLaws`) con card por ley = número + cámara + título + **timeline de trámite** (1ª media sanción →
2ª media sanción → sanción definitiva, con fechas y pasos alcanzados en verde) + expediente y fuente.
**Hallazgos:** (1) `leyes-sumario` corta en feb-2020 → los títulos recientes salen de
`proyectos-parlamentarios` (~53MB, 113k proyectos, se baja con timeout largo y se retienen sólo los
títulos en memoria); (2) el JSON de HCDN trae un BOM dentro del nombre de la primera clave. Verificado
`tsc`/`biome`/`next build` + `ruff`/`compileall` verdes.

**Hecho (2026-07-21) — Presentismo:** sin fuente nueva — se computa desde los `congress_vote_details`
que ya estaban ingeridos. Endpoint `/congress/attendance`: presentismo por bloque = votos no `AUSENTE`
sobre el total, agregado en SQL (`case`/`sum`), bloques con ≥1.000 votos, ordenado desc. Widget
`BlocAttendance` en `/congreso`: barras por bloque coloreadas (verde ≥85% / ámbar ≥75% / rojo <75%) con
disclaimer de alcance (Diputados, votaciones nominales 2011-2020). Verificado verde.

**5.f — Boletín Oficial con IA + Impuestómetro (el feature diferencial).** Pipeline nocturno: connector
`boletin_oficial` baja las normas del día (boletinoficial.gob.ar / primera+segunda sección), un paso
de IA (Claude headless, con la suscripción del server — sin API key) filtra las relevantes (impuestos, regulaciones, alícuotas) y las
resume en 3 viñetas → tabla `boletin_summaries(date, norma_id, title, summary, category, impact_tags)`.
Alimenta dos features: (1) **feed changelog** en el dashboard; (2) **Impuestómetro** = count curado de
impuestos vigentes (dataset semilla `taxes(code, name, jurisdiction, status, effective_date)`) que el
pipeline actualiza al detectar derogaciones/creaciones, mostrando el número gigante + timeline "Derogado
X en provincia Y (hace 2 días)". **Consideraciones**: costo recurrente de LLM (batchear, cachear por
`norma_id`), el resumen se marca "generado por IA, verificá contra la fuente" con link al Boletín, y el
count arranca de un dataset semilla curado a mano (no confiar el número base sólo a la IA). Research
spike previo sobre el acceso a boletinoficial.gob.ar (¿API/estructura estable?). Criterio de salida:
feed poblado ≥1 semana con corridas verdes; Impuestómetro con número auditado contra la semilla.

**Hecho (2026-07-20) — Impuestómetro (sin IA):** el "número gigante" ya está, sembrado desde una fuente
citable (no inventado). Comando CLI `seed-taxes` (`seed_taxes.py`) upserta a `indicator_history`
(source `iaraf`) las cifras del **IARAF — Vademécum Tributario**: `tributos_total/nacionales/
provinciales/municipales` para 2023 (148 = 45+25+78) y 2024 (155 = 46+25+84), verificadas contra la
fuente y aritméticamente consistentes. Widget `ImpuestometroCard` en la Home: número gigante (155) con
variación vs. año previo (+7, baja es buena), desglose Nación/provincias/municipios con barras, y la
nota "10 tributos = 92% de la recaudación (IVA 27%)", con atribución IARAF + fecha. **Pendiente 5.f:** el
**changelog/feed** de altas y bajas de impuestos (seedeable a mano) sigue pendiente.

**Hecho (2026-07-20) — Traductor del Boletín Oficial con IA:** pipeline completo, **sin API key** — usa
Claude headless con la **suscripción del server** (`claude -p`, el mismo auth que Claude Code en la
máquina), decisión del usuario para no pagar tokens de API. Connector `boletin_oficial`: la SPA
boletinoficial.gob.ar server-renderiza lo suficiente (`/seccion/primera` lista los avisos con URLs
`/detalleAviso/...`; cada detalle trae título+texto sin browser headless). Flujo: lista los avisos de la
primera sección del día, deduplica contra lo ya resumido (idempotente, no re-gasta LLM), baja el texto,
y en batches llama a `claude -p` (helper `llm.py`, salida JSON estricta parseada) para **clasificar
relevancia económica/regulatoria + resumir en 3 viñetas**; guarda sólo los relevantes en tabla propia
`boletin_summaries`. Corrida real verde (2 normas relevantes del 20-jul: reforma laboral + Agencia de
Transformación de Empresas Públicas, bien clasificadas y resumidas). Endpoint `/boletin/summaries` +
modelo/schema. Frontend: card "Boletín Oficial, en criollo" en la Home (feed con badge de categoría,
título, 3 viñetas, link a la norma y **disclaimer de IA — verificar contra la fuente**). **Notas de
deploy:** el connector debe correr en el **host** (donde vive el `claude` autenticado), no en el
contenedor del scraper; bounded por `MAX_AVISOS_PER_RUN` para respetar la suscripción. Verificado
`tsc`/`biome`/`next build` + `ruff`/`compileall` verdes. **5.f COMPLETA** (queda opcional el changelog
del Impuestómetro seedeado a mano).

**5.g — Data-hard, sólo tras research spike (no prometer en UI antes):**
- *Monitor de vivienda* — ✅ HECHO (2026-07-21). **Hallazgo del spike:** los precios por barrio del
  portal de CABA cortan en **2019** (el CSV "actividad venta" resultó ser DDJJ de funcionarios, mal
  etiquetado). Se pivoteó a lo que sí es **actual y limpio**: el **ICL del BCRA** (variable 40, Índice
  para Contratos de Locación, base 30/6/2020=1, diario, hasta hoy) como héroe en vivo, más el ranking
  de alquiler por barrio de CABA como **foto histórica 2019** (claramente rotulada, "referencia relativa
  entre barrios, no valor actual"). Connectors: `icl_bcra` → `indicator_history` code `icl`; `alquiler_caba`
  → tabla propia `rent_by_barrio` (último dato no vacío por barrio, 2 ambientes). Endpoint
  `/vivienda/rent-by-barrio` + modelo/schema. Widget `MonitorAlquileresCard` en la Home: ICL ×34,8 (dato
  de hoy) con variación interanual + sparkline, y ranking por barrio (Palermo/Núñez/Belgrano…) con la foto
  de ago-2019. Zonaprop/Argenprop descartados. Verificado `tsc`/`biome`/`next build` + `ruff`/`compileall`
  verdes.

  **Fuente original (contexto):** hay fuente oficial limpia, no hace falta scrapear Zonaprop/Argenprop. El portal **Buenos Aires Data** (`data.buenosaires.gob.ar`, CKAN de la
  Dirección Gral. de Estadísticas y Censos de CABA) publica el dataset **`mercado-inmobiliario`** con
  recursos **CSV** (además de XLSX): "Precio promedio alquiler", "Actividad inmobiliaria - venta" y
  "Monto de préstamos hipotecarios en UVA" (escrituras del Colegio de Escribanos). Complemento nacional:
  el **ICL** (Índice para Contratos de Locación, BCRA — Ley 27.551) como serie de referencia de ajuste
  de alquileres. **Plan cuando se retome:** connector `vivienda_caba` (CKAN `package_show` de CABA como
  hace `congreso`/`leyes`, resolviendo el CSV por nombre) → precio de alquiler y actividad de venta a
  tablas propias o a `indicator_history`; frontend con evolución + (opcional) desglose por barrio, incluso
  reusando el mapa de burbujas / centroides ya construido para barrios de CABA. Zonaprop/Argenprop quedan
  descartados (Cloudflare + reuso legalmente gris) al haber fuente oficial.
- *Termómetro de subsidios* ✅ HECHO (2026-07-21). El split "costo real vs subsidiado del usuario"
  no está como serie, pero sí el **gasto fiscal en subsidios económicos** (IMIG, base caja): dos series
  nuevas en `series_datosgob` — `subsidios_energia` (`452.2_ENERGIA...`) y `subsidios_transporte`
  (`452.2_TRANSPORTE...`), mensuales hasta 2026-05, en ARS millones. Widget `TermometroSubsidiosCard`
  en la Home: total del mes en billones + por rubro (energía/transporte) con sparkline y variación
  interanual nominal, con disclaimer de que es nominal y la caída real es mayor. Fuente Sec. de Hacienda
  vía datos.gob.ar. Verificado `tsc`/`biome`/`next build`/`ruff` verdes.

**Criterio de salida de la fase**: Home con al menos los contadores en vivo, un progress bar político
y las calculadoras personales; el pipeline del Boletín Oficial corriendo aunque sea en beta. Todo con
fuente+fecha, ningún dato dudoso escrito en silencio.

## Orden de ejecución y reversibilidad

Cada fase deja la app funcionando. Puntos de no retorno explícitos: drop de tablas de
auth (Fase 0, con backup previo) y borrado del módulo Java (Fase 2, recuperable por git).
