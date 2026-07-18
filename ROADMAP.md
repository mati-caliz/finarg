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
  (mensual), `ripte`, `indice_salarios`, `pobreza_personas` (total nacional, semestral, en %).
- `seed-events`: 19 hitos políticos curados 2001-2024 en `political_events` (para anotar series).

Fuente descartada: inflacionverdadera.com (página estática, data como imagen).

**Pendiente:** reservas diarias BCRA (endpoint v3 daba 410; portar del cliente Java), inflación de
alta frecuencia (consultoras/Alphacast — fuentes frágiles), Nowcast pobreza + ICG/ICC (UTDT, PDFs)
— habilitan el comparador de mediciones (INDEC vs UTDT vs UCA), Congreso (modelar tablas propias,
no encaja en indicator_history), y portar los módulos scraper-only. Integrar `scraper` al compose.

- Orden de conectores, de menor a mayor riesgo:
  1. Los de dificultad baja portados del Java (datos.gob.ar, BCRA, dolarapi, riesgo país):
     validan la arquitectura con fuentes conocidas.
  2. CBA/CBT, RIPTE, índice de salarios, pobreza oficial INDEC.
  3. inflacionverdadera.com (inflación diaria).
  4. ICG/ICC de UTDT y Nowcast de pobreza UTDT (PDFs — el más difícil, hacerlo al final
     con lo demás ya andando).
  5. Congreso (datos.hcdn.gob.ar + Senado).
  6. Portar los módulos scraper-only que quedaron en Java como referencia: `investments`
     (bonos, cauciones, cedears, ETFs, letras, metales, acciones), `news`, `crypto`, `holidays`.
     Escriben a la base pero sin UI por ahora (data disponible para features futuras).
- Scheduling con cron del host (una entrada por cadencia: 15min cotizaciones, diaria,
  semanal, mensual). Idempotencia por upsert sobre el índice único.
- Backfill histórico de cada serie hasta donde la fuente lo permita.

**Criterio de salida**: `scrape_runs` muestra corridas verdes de todas las fuentes de
dificultad baja/media, y al menos pobreza + inflación diaria pobladas con histórico.

### Fase 2 — API FastAPI (≈1-2 semanas)

- Crear la app FastAPI dentro de `api/` nueva (o `api-py/` durante la transición):
  endpoints de lectura sobre `indicator_history` + los actuales de cotizaciones,
  reservas, inflación, riesgo, bandas.
- Portar las tres calculadoras (sueldo neto, interés compuesto, ajuste por inflación):
  la lógica ya está resuelta en Java, es traducción directa.
- Endpoint `/indicators/{code}` genérico con filtros de fuente y rango de fechas,
  y `/indicators/{code}/sources` para el comparador de mediciones.
- Evaluar si Redis sigue haciendo falta: sirviendo desde PostgreSQL local probablemente
  alcance; si se saca, se saca también del compose.
- Cuando el frontend consuma 100% FastAPI: borrar el módulo Java y su Dockerfile.

**Criterio de salida**: Spring apagado, `web/` funcionando contra FastAPI sin regresiones.

### Fase 3 — Rediseño frontend + nombre (≈2-3 semanas)

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

### Fase 4 — Infra y lanzamiento (≈1 semana)

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
