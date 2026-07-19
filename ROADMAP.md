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

El volumen `finarg_postgres_data` está **compartido con otras apps** de la máquina (había tablas
de un restaurante y de una inmobiliaria). Las tablas de este proyecto son `users`, `alerts`,
`quote_history` y `news_articles`, todas vacías (0 filas). Se dropearon `users` y `alerts`; se
conservan `quote_history` (histórico valioso para cruzar con eventos políticos) y `news_articles`.
Backup completo en el scratchpad (`finarg-backup-2026-07-17.sql`).

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

**Pendiente:** sólo las fuentes frágiles — inflación de alta frecuencia (consultoras/Alphacast),
Nowcast pobreza + ICG/ICC (UTDT, PDFs/JS) — que habilitan el comparador de mediciones
(INDEC vs UTDT vs UCA). El resto (fuentes de dificultad baja/media, módulos scraper-only,
composición del Senado, integración al compose) está hecho.

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

**Pendiente:** único ítem grande restante = completar el rename backend `com.finarg`→`com.labrecha`
(Python ya usa `labrecha_*`; falta el módulo Java, que se apaga al no quedar nada del frontend
apuntándolo). Menores: `config/countries` quedó sólo por `store`/`queryKeys`/`types` (simplificable a
Argentina fija), y limpiar traducciones/`i18n` muertas.

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

**Pendiente (necesita edición coordinada del nginx compartido — NO hacer a ciegas):** el módulo
Java sigue en pie porque `nginx/nginx.conf` (que además sirve gastronova/portfolio/jobhunter en
prod) tiene `upstream backend { server backend:8080; }` y rutas `/api/`+`/actuator/health` hacia él;
si se saca el servicio `backend` del compose sin editar el nginx a la vez, nginx puede no levantar y
tirar los otros sitios. Retiro del Java = borrar `api/` + su servicio en ambos compose + sacar esas
directivas del nginx, todo junto. Falta también adaptar CI (`ci.yml` tiene build de Java/Maven) y
sumar el `scraper` al compose prod.

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

## Orden de ejecución y reversibilidad

Cada fase deja la app funcionando. Puntos de no retorno explícitos: drop de tablas de
auth (Fase 0, con backup previo) y borrado del módulo Java (Fase 2, recuperable por git).
