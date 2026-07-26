# Roadmap de mejoras — auditoría 2026-07-25

Plan de trabajo salido de una revisión completa del monorepo (scraper, api-py, shared, web, nginx,
CI). No agrega indicadores nuevos: cierra **bugs que ya están en producción**, tapa el agujero de
proceso (nada verifica lo que se deploya) y ataca la recurrencia del producto.

## Principios

Los mismos del resto del proyecto, que son justamente los que varios de estos bugs violan:

- **Ningún dato sin fuente + fecha visibles.** Aplica también a lo que la app *calcula*: la escala
  de Ganancias es un dato con vigencia, no una constante.
- **Nunca fabricar dato.** Un hueco en una serie se dibuja como hueco, no como línea plana ni como
  cero. Preferir el vacío honesto al relleno silencioso.
- **Fallar ruidosamente.** Un conector que no trajo nada no es un conector exitoso.
- **Reusar antes que crear.** Casi todo lo de acá es corregir o cablear algo que ya existe.

## Orden de ejecución

Las fases están ordenadas por riesgo cubierto, no por esfuerzo. La 1 va primero porque protege a
todas las demás: hoy no hay nada entre un `git push` y producción.

| Fase | Qué cubre | Esfuerzo | Riesgo si no se hace |
|---|---|---|---|
| ~~1~~ | ~~Red de seguridad: CI real + tests de la lógica de plata~~ ✅ | Bajo | Alto — se deploya sin verificar |
| 2 | Honestidad del dato: series, brechas, conectores mudos | Medio | Alto — contradice la regla dura del producto |
| 3 | Superficies muertas: service worker, manifest | Bajo | Medio — el PWA está roto y nadie se entera |
| 4 | Seguridad e infraestructura | Medio | Medio |
| 5 | SEO y distribución | Bajo | Medio — contenido que Google no ve |
| 6 | Producto: recurrencia | Alto | — (es crecimiento, no deuda) |
| 7 | Deuda de código | Bajo | Bajo |

---

## Fase 1 — Red de seguridad ✅ HECHA (2026-07-25)

Sin esto, cualquier fix de las fases siguientes puede romper otra cosa y enterarnos en producción.

**Resultado.** El deploy dejó de ser ciego: `deploy.yml` tiene un job `verify` que invoca a `ci.yml`
como reusable workflow y el job de deploy depende de él, así que un push a `main` que rompa
lint/tipos/tests/build **no llega al VPS**. El CI ahora corre `npm test` (136 tests, antes 76 y sin
ejecutarse nunca) y `pytest` (53 tests, antes 0 en todo el repo).

**Desvío respecto de lo planificado.** No se agregó el trigger `push: [main]` a `ci.yml`: habría
corrido el CI dos veces por cada push (una por el trigger, otra por la llamada desde el deploy). El
encadenamiento `deploy → ci` cubre el mismo objetivo con una sola corrida, y `ci.yml` mantiene el
trigger de `pull_request` para las ramas.

### 1.a — Que el CI corra de verdad ✅

**Problema.** `.github/workflows/ci.yml` dispara sólo en `pull_request`, pero la convención del repo
es commit directo a `main`: el CI **nunca se ejecuta**. `deploy.yml` sí corre en push a `main`, y
deploya sin ningún check previo.

**Hecho.** `deploy.yml` gana un job `verify` (`uses: ./.github/workflows/ci.yml`) y el job `deploy`
pasa a depender de él. Los jobs del CI se renombraron para reflejar que ahora también corren tests.

**Criterio de salida.** ✅ Un push a `main` con `tsc` roto no llega al VPS.

### 1.b — Correr los tests de Jest en CI ✅

**Problema.** Los 76 tests existentes pasan, pero no los corre nadie. Además el runner levanta
`.next/standalone` y tira *haste module naming collision*.

**Hecho.** `modulePathIgnorePatterns` sobre `.next` en `jest.config.js` (se fue la colisión de
haste) y paso `npm test` en el job de frontend, entre el type check y el build.

**Criterio de salida.** ✅ El CI corre los tests del front y falla si alguno rompe.

### 1.c — Tests de la lógica de plata (Python) ✅

**Problema.** `api-py/labrecha_api/income_tax.py` y `tax_impact.py` no tienen un solo test, y son lo
único de la app que devuelve una cifra sobre la plata del usuario. Hoy no hay **ningún** test de
Python en el repo.

**Hecho.** 53 tests nuevos en `api-py/tests`, sin base de datos: se testea la **lógica pura**, que es
donde vive el riesgo.

- `test_income_tax.py` (15): aguinaldo en el anual, sueldo bajo el mínimo → impuesto 0, neto =
  bruto − deducciones − impuesto, jubilado sin aportes/obra social/PAMI, cuota sindical por
  porcentaje ganándole al monto fijo, cargas de familia, hijos con discapacidad topeados por la
  cantidad de hijos, tope del seguro de vida, escalón único y progresividad entre dos escalones,
  monotonía del impuesto y de la alícuota efectiva respecto del sueldo.
- `test_tax_impact.py` (12): IVA extraído de gastos que ya lo incluyen (21/121), IIBB sobre el neto
  de IVA, jubilado sin aportes, prorrateo mensual, participación sobre el ingreso, tope de 365 días
  para el estado y fecha de liberación fiscal contada desde el 1 de enero.
- `test_terms.py` (16): composición de tasas (10 % + 10 % = 21 %, no 20 %), método por indicador,
  anualización indefinida sin span temporal o con caída total, extremos con primer valor 0 o
  negativo, fuente elegida por cobertura y consistencia de `TERMS` (ordenados, sin solaparse, sólo
  el mandato vigente abierto).
- `test_gaps.py` (10): brecha entre extremos con 2 y con 3 fuentes, orden irrelevante, base 0 sin
  división por cero, base negativa en valor absoluto.

Las partes que sí necesitan base (`indicator_by_term`, `list_gaps` y el resto de los routers) quedan
para cuando haya un Postgres de test; la lógica que esos endpoints delegan ya está cubierta.

**Criterio de salida.** ✅ `pytest` verde en CI; los cuatro módulos de cálculo tienen cobertura de
sus bordes.

### 1.d — Tests del front sobre lo que define al producto ✅

**Problema.** La cobertura actual es de primitivos (`Button`, `Card`, `Input`, skeletons) y
utilidades. Cero sobre la lógica que hace al observatorio.

**Hecho.** 60 tests nuevos: `lib/series.ts` (parseo, merge histórico/vivo, eje unión, downsample que
conserva extremos, anclaje de eventos al punto más cercano, rangos), `lib/gaps.ts` (`computeGap` en
`pct` y `pp`, base 0, base negativa, formato sin signo, integridad del catálogo curado),
`lib/freshness.ts` (bordes exactos por cadencia, con reloj congelado) y `lib/congress.ts` (conteo
por bloque, voto desconocido como ausente, orden por tamaño).

**Nota para la fase 2.a.** Los tests de `alignSources` cubren el forward-fill *posterior* al primer
punto, que es correcto. **No** se testeó el backfill previo ni el relleno con ceros: son el bug de
2.a y testearlos ahora sería consagrar el comportamiento que hay que cambiar. Cuando 2.a esté hecha,
esos dos casos se suman acá.

**Criterio de salida.** ✅ Cada helper puro que alimenta un gráfico o un número de la UI tiene test.

---

## Fase 2 — Honestidad del dato

Los bugs de esta fase contradicen la regla dura del producto. Son los más graves aunque no rompan
ninguna pantalla.

### 2.a — Las series dejan de inventar datos

**Problema.** `web/src/lib/series.ts:53-70` (`resample`): arranca con `last = points[0].value` y hace
forward-fill, así que para las fechas del eje **anteriores** al primer punto de una serie dibuja una
línea plana con el primer valor. En el comparador de brechas —donde las dos patas casi nunca
empiezan el mismo día— eso pinta una brecha que no existió. Si la serie viene vacía, devuelve un
array de **ceros**.

**Trabajo.**
- `resample` devuelve `number | null`: `null` antes del primer punto real y `null` para una serie
  vacía, en vez de fabricar.
- `AnnotatedSeriesChart` con `connectNulls={false}` para que Recharts corte la línea.
- Revisar los consumidores que asumen `number[]` (comparador de brechas, `IndicatorDetail`,
  sparkline de la OG image) y el cálculo de la banda `gapFill`, que no debe pintarse donde falta
  una de las dos patas.
- Tests: serie que arranca tarde, serie vacía, dos series con rangos disjuntos.

**Criterio de salida.** Un gráfico multi-fuente muestra hueco donde no hay dato, y la banda de brecha
sólo existe donde las dos fuentes midieron.

### 2.b — Un conector que trae 0 filas no es "success"

**Problema.** `scraper/labrecha_scraper/base.py:121` marca `success` sin mirar `rows_upserted`. El
caso vivo es `connectors/derived.py`: `_implicit_fx_points` cruza `monetary_base` (mensual) con
`international_reserves` (diaria) por **igualdad exacta de fecha** y saltea en silencio lo que no
matchea; si el BCRA corre una fecha de publicación, graba 0 filas, `/estado` lo muestra verde y
`scripts/scrape-alert.sh` no avisa. Cualquier scraper de HTML/PDF que empiece a devolver vacío se
comporta igual.

**Trabajo.**
- Mínimo esperado de filas por conector (atributo de la clase base, default 1). Si la corrida queda
  por debajo, estado `empty` — distinto de `success` y de `error`.
- `/estado` (`components/status/ScrapeStatus.tsx`) muestra `empty` en ámbar con su propio copy, y
  `scrape-alert.sh` lo cuenta como fallo.
- Arreglar de fondo el cruce de `implicit_fx_rate`: alinear por mes (o tomar el último dato de
  reservas ≤ la fecha de base monetaria) en vez de exigir la misma fecha exacta.

**Criterio de salida.** Un conector que no trae datos se ve rojo/ámbar en `/estado` y dispara la
alerta de Telegram.

### 2.c — Corridas zombi

**Problema.** Si el proceso muere (OOM, deploy en el medio), la fila queda en `status="running"` para
siempre y `/estado` la pinta ámbar eternamente.

**Trabajo.** Al arrancar una corrida, marcar como `error` (motivo: interrumpida) las corridas del
mismo `job_name` que sigan en `running` con más de N horas de antigüedad.

**Criterio de salida.** `/estado` no tiene corridas "en curso" de días.

### 2.d — `/gaps` automático: no comparar peras con manzanas

**Problema.** `api-py/labrecha_api/routers/gaps.py` (`_build_gap`) ordena por valor crudo entre
fuentes sin mirar la unidad. Si dos fuentes miden el mismo `indicator_code` en escalas distintas
(millones vs. unidades), el ranking de discrepancia se llena de brechas falsas que tapan las reales.

**Trabajo.** Filtrar por `meta.unit` coincidente entre las mediciones; si una fuente no declara
unidad, excluirla del ranking automático (o exponerla aparte, marcada). Documentar el criterio en
`/metodologia`.

**Criterio de salida.** El ranking de `/gaps` sólo compara mediciones de la misma unidad; las
descartadas se pueden auditar.

### 2.e — Vigencia visible de la escala de Ganancias

**Problema.** `api-py/labrecha_api/income_tax.py:22-48` tiene la escala y todos los mínimos
hardcodeados, **sin período de vigencia, sin fuente y sin tests**. Cuando ARCA actualiza (cada
semestre) la calculadora devuelve números mal con total confianza. Es el único lugar de la app donde
un dato se muestra sin fuente ni fecha.

**Trabajo.**
- Agrupar escala + deducciones en una estructura con `effective_from` y `source` (RG de ARCA).
- Devolver esos metadatos en la respuesta de la calculadora y renderizarlos en
  `/calculadora-sueldo-neto` con el patrón de atribución del design system.
- Aviso automático en la UI si la escala tiene más de 6 meses ("puede haber una actualización
  posterior; verificá contra ARCA"), reusando la idea de `lib/freshness.ts`.
- Los tests de 1.c cubren que el cálculo no cambió al refactorizar.

**Criterio de salida.** La calculadora dice de qué período es su escala y de dónde salió; una escala
vencida se avisa sola.

### 2.f — Rebase de las series deflactadas

**Problema.** `scraper/labrecha_scraper/connectors/derived.py:50` toma como base el **último** mes de
IPC, así que cada corrida reescribe toda la serie real: el CSV que alguien descargó el mes pasado ya
no coincide con el de hoy, y un número compartido en redes queda inconsistente.

**Trabajo.** Decidir y documentar: o base fija (un mes elegido, constante en el código) o base móvil
declarada en la UI ("pesos de <mes>"). El `meta.base_month` ya se graba; falta que la pantalla lo
muestre y que la decisión esté en `/metodologia`.

**Criterio de salida.** Toda serie `*_real` dice en qué pesos está expresada.

---

## Fase 3 — Superficies muertas

### 3.a — El service worker nunca se instala

**Problema.** `web/public/sw.js:7-24` precachea rutas de la era FinArg (`/login`, `/register`,
`/bandas-cambiarias`, `/comparador-tasas`) que no existen ni tienen redirect. `cache.addAll` es
atómico: un 404 rechaza la promesa y el evento `install` falla → **el PWA/offline no funciona desde
el pivot**, y el error sólo se ve en dev porque `lib/logger.ts` silencia todo en producción.

**Trabajo.**
- Precachear sólo rutas que existan (`/`, `/indicadores`, `/brechas`, `/calculadoras`, el manifest y
  los iconos), o directamente sacar el precache de páginas y dejar sólo estáticos.
- Borrar el handler `sync` (llama a `syncSimulations`, que no está definida en ningún lado) y los
  handlers `push`/`notificationclick`: la app no envía notificaciones. Si en la fase 6 aparecen las
  alertas, se reponen con el flujo real.
- Revisar que la estrategia `staleWhileRevalidate` sobre `/api/` no le gane a los TTL de
  `lib/cacheRules.ts` sirviendo dato viejo sin su aviso de frescura.
- Subir `CACHE_VERSION` para invalidar lo que haya quedado cacheado.

**Criterio de salida.** El SW instala sin error en una build de producción y la app abre offline.

### 3.b — Manifest apuntando a rutas viejas

**Problema.** `web/public/manifest.json` tiene `shortcuts` a `/cotizaciones` y `/inflacion`, que
sobreviven sólo por los 301 de `next.config.js`.

**Trabajo.** Apuntar los accesos directos a las rutas canónicas (`/indicador/dollar_blue`,
`/indicador/cpi_monthly`, `/calculadora-sueldo-neto`).

**Criterio de salida.** Ningún shortcut del manifest pasa por un redirect.

---

## Fase 4 — Seguridad e infraestructura

### 4.a — El rate limit de la API es cosmético

**Problema.** `api-py/labrecha_api/rate_limit.py:48` toma el primer elemento de `X-Forwarded-For`, y
`nginx/nginx.conf:278` usa `$proxy_add_x_forwarded_for`, que **preserva y antepone el header que
mandó el cliente**. Cualquiera manda un XFF aleatorio por request y saltea el limitador entero. Lo
único que frena de verdad es `limit_req zone=api` de nginx.

**Trabajo.** Usar `X-Real-IP` (nginx lo sobrescribe siempre, no es spoofeable) o tomar el **último**
elemento del XFF. Conservar la exención de la red interna para que el SSR no se auto-limite. Test que
verifique que un XFF forjado no crea claves nuevas.

**Criterio de salida.** Cien requests con `X-Forwarded-For` distintos desde la misma IP dan 429.

### 4.b — Endurecer el admin

**Problema.** En `web/src/lib/adminSession.ts` el token de sesión es un HMAC fijo de la password: no
expira, no se puede revocar sin cambiar la password, y `/api/admin/session` no tiene límite de
intentos, así que es brute-forceable desde internet. Con un solo admin es tolerable, pero es la única
superficie de escritura de la app.

**Trabajo.** Límite de intentos por IP en el route handler (basta un contador en memoria como el de
la API) y expiración real de la sesión (timestamp firmado dentro del token, no sólo `Max-Age` de la
cookie).

**Criterio de salida.** N intentos fallidos bloquean temporalmente; una sesión vieja deja de valer
sin tocar la password.

### 4.d — Observabilidad

**Problema.** No hay ningún reporte de errores; `lib/logger.ts` no hace nada en producción. Un error
de render en prod es invisible salvo que un usuario avise.

**Trabajo.** Sentry (o equivalente) en `web` y en `api-py`, con sampling bajo. Respetar el CSP: hay
que sumar el host del colector a `connect-src` en `next.config.js` (el nginx es compartido: tocar
sólo el server de este sitio).

**Criterio de salida.** Un error lanzado a propósito en prod aparece en el dashboard.

---

## Fase 5 — SEO y distribución

### 5.a — Sitemap completo

**Problema.** `web/src/app/sitemap.ts` no incluye `/ideas/[slug]` —las únicas páginas editoriales del
sitio—, ni `/congreso/votacion/[id]`, `/boletin.xml`, `/brechas.xml` o los `feed.xml` por indicador.

**Trabajo.** Generar el sitemap con las rutas dinámicas reales, leyendo posts y votaciones desde la
API con `serverGet` (respetando los TTL de `lib/cacheRules.ts`). Ojo con el volumen de votaciones:
acotar a las últimas N o partir en sitemaps por sección.

**Criterio de salida.** Cada idea publicada aparece en el sitemap el día que se publica.

### 5.b — Metadata por indicador con el número adentro

**Problema.** `generateMetadata` de `/indicador/[code]` arma una description genérica, sin último
valor ni fecha.

**Trabajo.** Incluir último valor + unidad + fecha en la description (la page ya prefetchea la serie,
así que el dato está a mano). Mismo criterio en `/brechas`.

**Criterio de salida.** El snippet de Google muestra la cifra vigente.

---

## Fase 6 — Producto: recurrencia

La plataforma tiene profundidad de datos; lo que no tiene es motivo para volver. Todo esto se apoya
en datos ya ingeridos.

### 6.a — Alertas por email

Ya está en `TODO.md`. Con RSS solamente, la recurrencia depende de un lector que casi nadie usa.
Necesita SMTP, tabla de suscriptores, doble opt-in y baja en un click. El contenido puede ser un
digest semanal armado sobre lo que ya existe: movimiento de las brechas curadas, indicadores que
cambiaron, novedades del Boletín. **Sin auth**: la suscripción es un email, no una cuenta — no
reabre nada de lo podado en la Fase 0 del pivot.

**Criterio de salida.** Alguien se suscribe, recibe el digest y se puede dar de baja sin escribirnos.

### 6.b — Variación desde un evento puntual

También en `TODO.md`. `/terms/{code}` ya corta cualquier serie por mandato; falta la versión libre:
"cuánto se movió esto desde el DNU 70/2023". Los eventos ya están en `political_events` y el método
de acumulación (composición para tasas, extremos para niveles) ya está resuelto y documentado en la
respuesta de la API.

**Criterio de salida.** Desde la página de un indicador se elige un evento político y se ve la
variación acumulada desde esa fecha, con el método explicitado.

### 6.c — La brecha entre lo votado y lo que pasó

La extensión natural de la marca y contenido que nadie más arma: cruzar `congress_votes` (ya con
resumen en lenguaje llano por IA) con las series económicas y `political_events`. Qué votó cada
bloque, y qué hizo después el indicador que la ley tocaba. Requiere curaduría (qué votación se cruza
con qué serie), así que arranca con un puñado de casos elegidos a mano, no automático.

**Criterio de salida.** Al menos 3 votaciones tienen su serie asociada y su lectura post-votación,
con la aclaración de que la correlación no es causalidad.

---

## Fase 7 — Deuda de código

- **`IndicatorDetail.tsx` (867 líneas)** e **`indicators.ts` (684 líneas)**: los dos archivos más
  grandes del front. Partir por responsabilidad (header + gráfico + panel de brecha + tabla; y
  metadata de catálogo vs. formateadores).
- **`lib/freshness.ts`**: el tipo `Cadence` usa literales en español (`"diaria"`, `"mensual"`) como
  identificadores de código, contra la regla del repo. Pasarlos a inglés y dejar el español sólo en
  el copy.
- **`shared/labrecha_db/models.py`**: `Mapped[dict]` y `Mapped[list | None]` sin parametrizar; y
  `RentByNeighborhood` tiene PK sólo en `neighborhood` pese a tener columna `date`, así que no puede
  guardar historia (hoy es una foto). Decidir si es intencional y, si no, migrar la PK.
- **DNS**: `nginx/nginx.conf` sigue sirviendo `finlatamio.com`; `labrecha.ar` sigue pendiente de
  registro/apuntado (ya anotado en `ROADMAP.md`). Es del usuario, no del código.

---

## Verificación

Sin cambios respecto del resto del repo:

- Front (`cd web`): `npx tsc --noEmit`, `npm run lint:check`, `npm run build`, `npm test`.
- Python: `ruff check` + `ruff format --check` sobre los tres paquetes, `python -m compileall`, y
  —nuevo, desde la fase 1.c— `pytest`.
- Datos: `labrecha-scraper db check` y `run <job>` contra el Postgres local (puerto 5433).
- Cada fase deja la app funcionando y se commitea directo a `main`, en español.
