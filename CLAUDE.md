# La Brecha — configuración para asistentes de IA

**La Brecha** es un observatorio público (solo lectura, sin auth) de métricas político-económicas
de Argentina: reúne indicadores dispersos (INDEC, BCRA, datos.gob.ar, consultoras, Congreso) en una
sola fuente. Dos features definitorias que el producto hace brillar:

1. **La brecha entre mediciones** — un mismo indicador medido por fuentes distintas (reservas BCRA
   vs datos.gob.ar; inflación oficial vs esperada). Mostrar la discrepancia ES la feature.
   Conviven dos tipos: las **curadas** en `web/src/lib/gaps.ts`, que enfrentan indicadores
   *distintos* (blue vs oficial, esperada vs medida), y las **automáticas** de `GET /gaps`, que
   salen solas de los datos: todo `indicator_code` con ≥2 `source`, comparado en la última fecha
   en que ambas midieron y rankeado por discrepancia.
2. **Series anotadas con eventos políticos** — elecciones, cambios de gobierno, DNUs cruzados con lo
   económico sobre la misma línea de tiempo. Además `GET /terms/{code}` corta cualquier serie por
   mandato presidencial (`api-py/labrecha_api/government_terms.py`): las series de tasa se acumulan
   **componiendo** (`MONTHLY_RATE_INDICATORS`) y las de nivel comparan extremos; la respuesta
   informa qué método usó y la UI lo explicita.

El nombre juega con el doble sentido: brecha cambiaria + brecha entre mediciones. Dominio objetivo
`labrecha.ar`. El plan del pivot (desde el proyecto original "FinArg") y su historial están en
`ROADMAP.md`.

## Arquitectura

Monorepo de tres piezas; **PostgreSQL es el contrato** entre ellas (sin colas ni mensajería):

```
shared/    Paquete `labrecha_db`: los modelos SQLAlchemy (única definición del esquema)
           y las migraciones Alembic. Lo instalan tanto el scraper como la API.
scraper/   Python (SQLAlchemy + httpx + pydantic). Un conector = un módulo en
           labrecha_scraper/connectors/. Corridos por cron, escriben a Postgres.
api-py/    FastAPI de solo lectura sobre Postgres + calculadoras. Sin estado, sin auth. Es
           producto además de backend: gzip, rate limiting por IP (`rate_limit.py`, exento para
           la red interna así el SSR no se auto-limita), CSV por serie y docs en /docs.
web/       Next.js 16 (App Router) + React 18 + TS + Tailwind + Recharts.
```

Los modelos viven **sólo** en `shared/labrecha_db/models.py`: ni el scraper ni la API definen
tablas propias. Todo cambio de esquema va con una migración Alembic
(`shared/labrecha_db/migrations/versions/`), que se aplica con `labrecha-scraper db upgrade`
(el deploy la corre antes de levantar los servicios). Como el contexto de build de las imágenes
Python es la raíz del repo (necesitan `shared/`), los Dockerfiles se referencian como
`dockerfile: api-py/Dockerfile` / `scraper/Dockerfile`.

No hay backend Java ni Redis: el stack Spring original fue retirado por completo.

### Modelo de datos

- `indicator_history(indicator_code, source, date, value, metadata)` — tabla genérica de todos los
  indicadores en serie temporal; único por `(indicator_code, source, date)`. Un mismo
  `indicator_code` puede tener varias `source` (el comparador de mediciones sale de acá).
- `scrape_runs` — tracking de cada corrida de conector (estado, filas, error). Todo scraper de
  PDF/HTML es frágil: debe fallar ruidosamente acá, nunca escribir datos dudosos en silencio.
- `political_events(date, title, category, description)` — para anotar las series.
- Tablas propias para lo que no encaja en la genérica: `congress_votes`/`congress_vote_details`
  (votaciones nominales de Diputados), `senators`, `holidays`, `news_articles`.
- `congress_vote_summaries` — el título del acta de una votación es burocrático ("Expediente
  0073-S-2019 - Votación en General"), así que el conector `congress_summaries` cruza los
  expedientes citados contra el dataset de proyectos parlamentarios de HCDN y le pide a Claude
  (vía `llm.py`, igual que el Boletín Oficial) una oración en lenguaje llano + un tema. El resumen
  se muestra siempre junto al título oficial y aclarando que lo generó una IA.

**Regla dura de producto:** ningún dato se muestra sin su fuente + fecha visibles (requisito legal
con algunas fuentes). El patrón de atribución es parte del diseño.

### Frontend (web/)

- Consume la FastAPI vía un **proxy same-origin (BFF)**: el navegador pega a `/api/data/...` y el
  route handler `src/app/api/data/[...path]/route.ts` proxya a la FastAPI
  (`LABRECHA_API_INTERNAL_URL`, default `api-py:8000`) con caché ISR por ruta (GET) y reenvío de POST
  (calculadoras). El cliente de datos está en `src/lib/labrechaApi.ts` y es **isomórfico**: en el
  navegador pega al proxy con axios, y en el servidor va directo a la FastAPI vía `serverGet`
  (`src/lib/serverApi.ts`), sin el salto extra del BFF y con la caché de datos de Next. Los TTL por
  ruta son únicos y viven en `src/lib/cacheRules.ts` (los usan el proxy y `serverGet`).
- **Datos en el servidor:** cada `page.tsx` es un Server Component que prefetchea sus queries y las
  hidrata con `<PrefetchedQueries>` (`src/lib/prefetch.tsx`); los componentes siguen siendo client
  components con `useQuery` y reciben la data ya cacheada, así que el HTML sale con contenido real
  (no skeletons) y las páginas se prerenderizan con ISR. Para que la clave del prefetch no pueda
  divergir de la del hook, ambas salen de las mismas factorías en `src/lib/queries.ts`; qué queries
  necesita cada ruta está en `src/lib/pageQueries.ts` y los parámetros compartidos en
  `src/lib/queryParams.ts` (módulo plano: un `"use client"` exporta referencias, no valores, así que
  las constantes que lee el servidor **no** pueden vivir en un componente cliente). Los hooks de
  `src/hooks/useLabrecha.ts` son la cara cliente de esas mismas factorías.
- **SEO:** JSON-LD en `src/lib/structuredData.ts` (`WebSite` en el layout, `Dataset` +
  `BreadcrumbList` por indicador, `Article` por idea), emitido con `<JsonLd>`, que escapa
  `<`/`>`/`&` a `\uXXXX` para poder inyectarlo como texto (biome tiene `security: all`, así que no
  se usa `dangerouslySetInnerHTML`).
- **Sistema de diseño:** dirección **"Editorial"** (periodística de datos) de Claude Design. Los
  tokens `oklch` (light + dark) viven en `src/app/globals.css`, bloque "Design system v2":
  superficies `--paper`/`--surface`/`--raise`, tinta `--ink`/`--ink2`/`--ink3`, líneas
  `--line`/`--line2`, **`--gap` ámbar** para discrepancias entre fuentes, **`--event` violeta**
  para eventos políticos, `--pos`/`--neg`, `--chart`. Tres tipografías: **Bricolage Grotesque**
  (`--font-display`, titulares), **Newsreader** (`--font-serif`, prosa), **JetBrains Mono**
  (`--font-jb-mono`, números/labels/eyebrows). Regla: ningún número va en serif/sans, siempre mono
  tabular. El plan y estado de la migración están en `ROADMAP-REDISENO.md`. Los tokens legacy
  ("Observatorio claro") ya se eliminaron; conviven sólo el bloque v2, un bloque de primitivos
  genéricos (fonts, `--serie-N`, spacing, radios, sombras) y el sistema HSL de shadcn (`--background`,
  `--foreground`, `--border`… que usan los componentes `ui/`).
- Layout: **top-nav sticky sin sidebar** (`SiteHeader`/`SiteFooter`); ancho máximo 1200px centrado;
  headers de sección con eyebrow mono + regla 2px. Los componentes core (`src/components/core/`:
  AnnotatedSeriesChart, Card, Badge, Button, DataTable, etc.) usan los tokens v2.
- Rutas (URLs en español, igual que el copy; los identificadores de código siguen en inglés):
  `/` (Estado del país), `/estado`, `/indicador/[code]` (serie anotada + comparador de fuentes),
  `/brechas` (curadas + automáticas), `/metodologia`, `/api-publica`, `/indicadores`, `/congreso` (+ `/congreso/votacion/[voteRecordId]`), `/noticias`,
  `/feriados`, `/calculadoras` (+ `/calculadora-sueldo-neto`, `/calculadora-impacto-fiscal`,
  `/calculadora-interes-compuesto`, `/calculadora-ajuste-inflacion`), `/boletin.xml`, `/brechas.xml` (con `?min=`) y `/indicador/[code]/feed.xml` (RSS). Los
  endpoints del backend (FastAPI, vía el proxy `/api/data`) **sí** siguen en inglés
  (`/indicators`, `/congress/votes`, `/holidays`, `/news`, `/calculators/...`, `/gazette/...`).
  Las URLs viejas en inglés redirigen (301) a las nuevas en `next.config.js`.
- Estilos: los componentes core usan estilos inline con variables del design system; el resto,
  utilidades de Tailwind. Números en formato argentino (punto de miles, coma decimal) y mono tabular.

## Reglas de estilo de código

- **No escribir comentarios.** El código se explica por nombres claros.
- **Igualdad estricta**: siempre `===` / `!==`.
- **Sin `any` ni casteos inseguros** (`as unknown as X`), sin `@ts-ignore`, sin `eslint-disable` /
  `biome-ignore`: resolver la causa real (tipar bien, borrar código muerto).
- **Sin `var`**; `const` por default, `let` sólo si se reasigna.
- **Nombres completos y semánticos** (`product`, no `p`; `transaction`, no `tx`). `i`/`j` sólo en
  loops triviales. Sin magic numbers/strings: extraer constantes.
- **Todo identificador de código en inglés**: nombres de variables, funciones, clases, tipos,
  propiedades y nombres de archivos/carpetas van en inglés, incluidos los términos de dominio
  (`quote` no `cotizacion`, `inflation` no `inflacion`, `gap` no `brecha`, `reserves` no `reservas`).
  El español queda **sólo** para el texto que ve el usuario (copy de la UI, labels, contenido). El
  nombre del producto "La Brecha" y el token de marca no son identificadores traducibles.
- Python: inyección por módulo/función, tipado con pydantic; conectores del scraper extienden la
  clase base y registran en `scrape_runs`.

## Verificación

- Frontend (`cd web`): `npx tsc --noEmit`, `npm run lint:check` (Biome, no ESLint), `npm run build`.
- API/scraper/shared: `ruff check api-py/labrecha_api scraper/labrecha_scraper shared/labrecha_db`
  + `ruff format --check` (la config de `ruff.toml` es estricta: casi todas las familias de reglas),
  y byte-compile con `python -m compileall` sobre esos tres paquetes.
- Datos: el scraper corre con `python -m labrecha_scraper run <job|all>` (ver `list`, `status`,
  `seed-events`); el esquema se crea/actualiza con `db upgrade` y se audita con `db check`
  (compara la base real contra los modelos). Postgres en el puerto 5433 en local.
  Una base preexistente creada con el viejo `create_all` la adopta el propio `db upgrade`: si no
  tiene `alembic_version` pero su esquema es idéntico a los modelos, la marca en la revisión actual
  en vez de re-crear tablas; si difiere, corta y lista las diferencias en vez de migrar a ciegas
  (`db stamp --force` fuerza la marca).
- `docker compose up -d` levanta postgres + api-py + web; el scraper corre on-demand
  (`docker compose run --rm scraper <job>`).

## Notas

- Git: commits descriptivos en español, directo a `main`.
- El `nginx/nginx.conf` es **compartido** con otros sitios en producción (gastronova, portfolio,
  jobhunter): editarlo con cuidado quirúrgico, tocando sólo el server de `finlatamio.com`.
- En archivos `.md` no duplicar lo derivable del código o `package.json`; conservar sólo el contexto
  de negocio no obvio.
