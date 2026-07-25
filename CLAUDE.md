# La Brecha — configuración para asistentes de IA

**La Brecha** es un observatorio público (solo lectura, sin auth) de métricas político-económicas
de Argentina: reúne indicadores dispersos (INDEC, BCRA, datos.gob.ar, consultoras, Congreso) en una
sola fuente. Dos features definitorias que el producto hace brillar:

1. **La brecha entre mediciones** — un mismo indicador medido por fuentes distintas (reservas BCRA
   vs datos.gob.ar; inflación oficial vs esperada). Mostrar la discrepancia ES la feature.
2. **Series anotadas con eventos políticos** — elecciones, cambios de gobierno, DNUs cruzados con lo
   económico sobre la misma línea de tiempo.

El nombre juega con el doble sentido: brecha cambiaria + brecha entre mediciones. Dominio objetivo
`labrecha.ar`. El plan del pivot (desde el proyecto original "FinArg") y su historial están en
`ROADMAP.md`.

## Arquitectura

Monorepo de tres piezas; **PostgreSQL es el contrato** entre ellas (sin colas ni mensajería):

```
scraper/   Python (SQLAlchemy + httpx + pydantic). Un conector = un módulo en
           labrecha_scraper/connectors/. Corridos por cron, escriben a Postgres.
api-py/    FastAPI de solo lectura sobre Postgres + calculadoras. Sin estado, sin auth.
web/       Next.js 16 (App Router) + React 18 + TS + Tailwind + Recharts.
```

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

**Regla dura de producto:** ningún dato se muestra sin su fuente + fecha visibles (requisito legal
con algunas fuentes). El patrón de atribución es parte del diseño.

### Frontend (web/)

- Consume la FastAPI vía un **proxy same-origin (BFF)**: el navegador pega a `/api/data/...` y el
  route handler `src/app/api/data/[...path]/route.ts` proxya a la FastAPI
  (`LABRECHA_API_INTERNAL_URL`, default `api-py:8000`) con caché ISR por ruta (GET) y reenvío de POST
  (calculadoras). El cliente axios está en `src/lib/labrechaApi.ts`; los hooks TanStack Query en
  `src/hooks/useLabrecha.ts`.
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
- Rutas (URLs en inglés; el copy sigue en español): `/` (Estado del país), `/status`,
  `/indicator/[code]` (serie anotada + comparador de fuentes), `/gaps`, `/indicators`,
  `/congress` (+ `/congress/vote/[voteRecordId]`), `/news`, `/holidays`, `/calculators`.
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
- API/scraper: byte-compile con `python -m compileall labrecha_api` / `labrecha_scraper`.
- Datos: el scraper corre con `python -m labrecha_scraper run <job|all>` (ver `list`, `status`,
  `seed-events`, `init-db`); Postgres del volumen compartido en el puerto 5433 en local.
- `docker compose up -d` levanta postgres + api-py + web; el scraper corre on-demand
  (`docker compose run --rm scraper <job>`).

## Notas

- Git: commits descriptivos en español, directo a `main`.
- El `nginx/nginx.conf` es **compartido** con otros sitios en producción (gastronova, portfolio,
  jobhunter): editarlo con cuidado quirúrgico, tocando sólo el server de `finlatamio.com`.
- En archivos `.md` no duplicar lo derivable del código o `package.json`; conservar sólo el contexto
  de negocio no obvio.
