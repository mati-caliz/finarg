# La Brecha — configuración para asistentes de IA

Observatorio público (solo lectura, sin auth) de métricas político-económicas de Argentina: reúne
indicadores dispersos (INDEC, BCRA, datos.gob.ar, consultoras, Congreso) en una sola fuente. Dominio
objetivo `labrecha.ar`. El pivot desde el proyecto original "FinArg" y su historial están en
`ROADMAP.md`; el rediseño en `ROADMAP-REDISENO.md`; la auditoría 2026 y su plan en
`ROADMAP-MEJORAS.md`.

Dos features definitorias:

1. **La brecha entre mediciones.** Mostrar la discrepancia ES la feature. Las **curadas**
   (`web/src/lib/gaps.ts`) enfrentan indicadores *distintos* (blue vs oficial, inflación esperada vs
   medida); las **automáticas** (`GET /gaps`) salen solas de los datos: todo `indicator_code` con ≥2
   `source` **que declaren la misma `meta.unit`**, comparado en la última fecha en que ambas midieron.
   Otra unidad o sin unidad declarada queda fuera del ranking (comparar millones contra unidades
   inventa brechas de escala) y viaja en `excluded_sources` con el motivo.
2. **Series anotadas con eventos políticos.** `GET /terms/{code}` corta cualquier serie por mandato
   presidencial (`api-py/labrecha_api/government_terms.py`): las tasas se acumulan **componiendo**
   (`MONTHLY_RATE_INDICATORS`), los niveles comparan extremos; la respuesta dice qué método usó y la
   UI lo explicita.

## Reglas duras de producto

- **Ningún dato se muestra sin su fuente + fecha visibles** (requisito legal con algunas fuentes): el
  patrón de atribución es parte del diseño. Aplica a lo que la app *calcula*: la escala de Ganancias
  (`api-py/labrecha_api/income_tax.py`) es un `IncomeTaxScale` con `effective_from` + `source` que
  viaja en la respuesta, y la UI avisa sola cuando pasó un semestre (ARCA actualiza cada seis meses).
- **Nunca fabricar dato.** `web/src/lib/series.ts` devuelve `null` —no el primer valor, no cero— antes
  del primer punto de una fuente; el chart corta la línea y sólo pinta la banda de brecha donde las
  dos fuentes midieron. Las series `*_real` de `connectors/derived.py` se deflactan contra un **mes
  base fijo** (`DEFLATED_BASE_MONTH`) para que un CSV descargado el mes pasado siga coincidiendo.
- **Fallar ruidosamente.** Todo scraper de PDF/HTML es frágil: que quede en `scrape_runs`, nunca
  escribir datos dudosos en silencio.

## Arquitectura

Monorepo de cuatro piezas; **PostgreSQL es el contrato** entre ellas (sin colas ni mensajería). No hay
backend Java ni Redis: el stack Spring original fue retirado por completo.

- `shared/` — paquete `labrecha_db`: modelos SQLAlchemy (**única** definición del esquema) +
  migraciones Alembic. Lo instalan el scraper y la API; ninguno de los dos define tablas propias. Todo
  cambio de esquema va con migración, aplicada por `labrecha-scraper db upgrade` (el deploy la corre
  antes de levantar los servicios) y auditable con `db check` contra los modelos.
- `scraper/` — un conector = un módulo en `labrecha_scraper/connectors/`, extiende la clase base y
  registra en `scrape_runs`. Corre por cron.
- `api-py/` — FastAPI de solo lectura + calculadoras. Sin estado, sin auth; es producto además de
  backend (gzip, CSV por serie, docs en `/docs`, rate limit por IP exento para la red interna así el
  SSR no se auto-limita).
- `web/` — Next.js 16 (App Router) + React 18 + TS + Tailwind.

El contexto de build de las imágenes Python es la raíz del repo (necesitan `shared/`), de ahí
`dockerfile: api-py/Dockerfile` en el compose.

**IP del cliente:** `X-Real-IP` (nginx la sobrescribe siempre) o, si falta, el **último** hop de
`X-Forwarded-For` — nunca el primero, que lo controla el cliente. `api-py/labrecha_api/rate_limit.py`
y `web/src/lib/clientIp.ts`.

## Modelo de datos

- `indicator_history(indicator_code, source, date, value, meta)` — tabla genérica de toda serie
  temporal, única por `(indicator_code, source, date)`. Varias `source` por `indicator_code`: de ahí
  sale el comparador de mediciones.
- `scrape_runs` — una fila por corrida. Estados: `running`, `success`, `error` y **`empty`** (terminó
  sin excepción pero trajo menos filas que el `min_rows` del conector — default 1; los que
  legítimamente pueden no traer nada nuevo declaran `min_rows = 0`). `empty` sale ámbar en `/estado` y
  cuenta como fallo para `scripts/scrape-alert.sh`. Al arrancar un job, `close_interrupted_runs` cierra
  como `error` las corridas del mismo job en `running` hace más de 6 h (proceso muerto, deploy en el
  medio).
- `political_events(date, title, category, description)` — anota las series.
- `error_events` — errores de producción **agrupados por fingerprint** (origen + tipo + mensaje
  normalizado + primera línea del stack, con números y valores entre comillas reemplazados), con
  contador y `first/last_seen_at`. Lo escriben la API (`exception_handler`, sólo excepciones no
  manejadas: los 404/422 no son ruido), el SSR de Next (`instrumentation.ts`) y el navegador
  (`ErrorBoundary` y `lib/logger.ts`) vía `POST /errors`, que es same-origin —así no hay que tocar
  ninguno de los **dos** CSP (el de `next.config.js` y el del nginx compartido)— y queda cubierto por
  el rate limit por IP. Se ve en `/estado`.
- Tablas propias para lo que no encaja en la genérica: `congress_votes`/`congress_vote_details`,
  `senators`, `holidays`, `news_articles`, `congress_vote_summaries`.
- `congress_vote_summaries` — el título del acta es burocrático ("Expediente 0073-S-2019 - Votación en
  General"), así que `connectors/congress_summaries` cruza los expedientes citados contra el dataset de
  proyectos de HCDN y le pide a Claude (vía `llm.py`, igual que el Boletín Oficial) una oración en
  lenguaje llano + un tema. Siempre se muestra junto al título oficial y aclarando que lo generó una
  IA. Las votaciones que no se pudieron resumir guardan igual su fila con `summary` en NULL: es la
  marca de "ya intentada" — sin ella coparían la ventana acotada de cada corrida y el backfill nunca
  avanzaría. Se reintentan a los 30 días.

## Frontend (web/)

- **BFF same-origin:** el navegador pega a `/api/data/...` y `src/app/api/data/[...path]/route.ts`
  proxya a la FastAPI (`LABRECHA_API_INTERNAL_URL`) con ISR por ruta. El cliente
  (`src/lib/labrechaApi.ts`) es **isomórfico**: en el browser va por el proxy, en el servidor directo
  a la API vía `serverGet` (`src/lib/serverApi.ts`). Los TTL son únicos y viven en
  `src/lib/cacheRules.ts`.
- **Datos en el servidor:** cada `page.tsx` prefetchea sus queries y las hidrata con
  `<PrefetchedQueries>`, así el HTML sale con contenido real (no skeletons) y las páginas se
  prerenderizan. Para que la clave del prefetch no pueda divergir de la del hook, ambas salen de las
  factorías de `src/lib/queries.ts`; qué necesita cada ruta está en `src/lib/pageQueries.ts` y los
  params compartidos en `src/lib/queryParams.ts` — **módulo plano a propósito**: un `"use client"`
  exporta referencias, no valores, así que las constantes que lee el servidor no pueden vivir en un
  componente cliente.
- **Admin (única superficie de escritura):** `/admin` se autentica contra `ADMIN_PASSWORD` y guarda
  una cookie HttpOnly cuyo token es `<expiresAt>.<hmac>` — el vencimiento va **dentro** de la firma
  (`lib/adminSession.ts`), no sólo en el `Max-Age`. El login limita intentos por IP en memoria
  (`lib/loginAttempts.ts`).
- **Diseño:** dirección "Editorial" (periodística de datos); tokens `oklch` light+dark en
  `src/app/globals.css`, bloque "Design system v2" — ahí están los nombres, no hace falta listarlos
  acá. **`--gap` ámbar** es siempre discrepancia entre fuentes y **`--event` violeta** siempre evento
  político. Tres tipografías: display (titulares), serif (prosa), mono (números/labels). Regla: ningún
  número va en serif o sans, siempre **mono tabular** y en formato argentino (punto de miles, coma
  decimal). Los componentes de `src/components/core/` usan estilos inline con esas variables; el resto,
  Tailwind.
- **URLs en español** igual que el copy (`/indicador/[code]`, `/brechas`, `/calculadoras`…); las viejas
  en inglés redirigen 301 en `next.config.js`. Los endpoints de la FastAPI **sí** quedan en inglés.
- **SEO:** JSON-LD en `src/lib/structuredData.ts`, emitido con `<JsonLd>`, que escapa `<`/`>`/`&` a
  `\uXXXX` para inyectarlo como texto: biome corre con `security: all`, así que no se usa
  `dangerouslySetInnerHTML`.

## Reglas de estilo de código

- **No escribir comentarios.** El código se explica por nombres claros.
- **Sin `any` ni casteos inseguros** (`as unknown as X`), sin `@ts-ignore`, sin `biome-ignore` /
  `eslint-disable`: resolver la causa real (tipar bien, borrar código muerto).
- Igualdad estricta (`===`/`!==`). Sin `var`; `const` por default. Sin magic numbers/strings.
- **Nombres completos y semánticos** (`product` no `p`, `transaction` no `tx`); `i`/`j` sólo en loops
  triviales.
- **Todo identificador de código en inglés**, incluidos los términos de dominio (`quote` no
  `cotizacion`, `gap` no `brecha`, `reserves` no `reservas`). El español queda **sólo** para el texto
  que ve el usuario. "La Brecha" como nombre de producto no se traduce.
- Python: inyección por módulo/función, tipado con pydantic.

## Verificación

- Front (`cd web`): `npx tsc --noEmit`, `npm run lint:check` (Biome, **no** ESLint), `npm test`,
  `npm run build`.
- Python: `ruff check` + `ruff format --check` sobre `api-py/labrecha_api api-py/tests
  scraper/labrecha_scraper shared/labrecha_db` (`ruff.toml` es estricto), `python -m compileall` y
  `python -m pytest api-py/tests` (lógica pura de cálculo, sin base).
- **El CI corre todo esto y bloquea el deploy**: `deploy.yml` invoca a `ci.yml` (`needs: verify`), así
  que un push a `main` que rompa lint/tipos/tests/build no llega al VPS.
- Datos: `python -m labrecha_scraper run <job|all>` (ver `list`, `status`). Postgres local en el 5433;
  `docker compose up -d` levanta postgres + api-py + web y el scraper corre on-demand.

## Notas

- Git: commits descriptivos en español, directo a `main`.
- `nginx/nginx.conf` es **compartido** con otros sitios en producción (gastronova, portfolio,
  jobhunter): editarlo con cuidado quirúrgico, tocando sólo el server de este sitio.
- En archivos `.md` no duplicar lo derivable del código o `package.json`: sólo contexto de negocio no
  obvio. Aplica a este archivo — se carga entero en cada request.
