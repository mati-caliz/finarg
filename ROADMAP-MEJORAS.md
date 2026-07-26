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
| ~~2~~ | ~~Honestidad del dato: series, brechas, conectores mudos~~ ✅ | Medio | Alto — contradice la regla dura del producto |
| ~~3~~ | ~~Superficies muertas: service worker, manifest~~ ✅ | Bajo | Medio — el PWA está roto y nadie se entera |
| 4 | Seguridad e infraestructura — 4.a/4.b ✅, 4.c y 4.d pendientes (decisión del usuario) | Medio | Medio |
| ~~5~~ | ~~SEO y distribución~~ ✅ | Bajo | Medio — contenido que Google no ve |
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

## Fase 2 — Honestidad del dato ✅ HECHA (2026-07-26)

Los bugs de esta fase contradecían la regla dura del producto. Eran los más graves aunque no
rompieran ninguna pantalla.

**Desvíos respecto de lo planificado.**

- El gráfico no usa Recharts (es SVG propio en `components/core/AnnotatedSeriesChart.tsx`), así que
  en vez de `connectNulls={false}` el corte de línea y la banda de brecha se implementaron a mano:
  `linePath` levanta la lapicera en cada `null` y `gapAreaPath` pinta un subpath por cada tramo en
  que ambas series midieron.
- 2.f se resolvió por **base fija** (la otra opción del plan era base móvil declarada). Con base
  móvil cada corrida seguía reescribiendo la serie entera; la base fija es la única que hace que un
  CSV descargado el mes pasado siga coincidiendo.
- 2.e destapó una inconsistencia que el plan no preveía: la escala del art. 94 era la del período
  anual 2025 pero las deducciones eran las del primer semestre de 2025, o sea que la calculadora
  mezclaba dos períodos. Se unificó todo en el período vigente (julio a diciembre de 2026,
  importes acumulados a diciembre) verificado contra los PDF de ARCA.
- No se agregaron tests de Python al scraper (`_latest_at_or_before`, `close_interrupted_runs`): hoy
  el CI sólo corre `pytest` sobre `api-py/tests` y sumar un paquete de tests del scraper es trabajo
  de la red de seguridad, no de esta fase. Queda anotado como deuda en la Fase 7.

### 2.a — Las series dejan de inventar datos ✅

**Problema.** `web/src/lib/series.ts` (`resample`): arrancaba con `last = points[0].value` y hacía
forward-fill, así que para las fechas del eje **anteriores** al primer punto de una serie dibujaba
una línea plana con el primer valor. En el comparador de brechas —donde las dos patas casi nunca
empiezan el mismo día— eso pintaba una brecha que no existió. Si la serie venía vacía, devolvía un
array de **ceros**.

**Hecho.** `resample` devuelve `(number | null)[]`: `null` antes del primer punto real y `null` en
toda la serie si no hay ni un punto. El forward-fill *posterior* se mantiene (un dato mensual sigue
vigente hasta la medición siguiente). `SeriesPoint.v` pasó a `number | null` y el chart corta la
línea, no dibuja el punto de hover y muestra "sin dato" en el tooltip; la banda de brecha se pinta
por tramos y su leyenda sólo aparece si existe al menos un tramo. La tabla del indicador muestra
"—" y no calcula brecha donde falta una pata.

**Tests.** Se sumaron los tres casos que 1.d dejó pendientes (serie que arranca tarde, serie vacía,
fuentes con rangos disjuntos) y un suite nuevo del chart (`AnnotatedSeriesChart.test.tsx`): corte de
la línea, serie sin ningún valor, banda sólo donde las dos midieron, leyenda ausente sin solape.

**Criterio de salida.** ✅ Un gráfico multi-fuente muestra hueco donde no hay dato y la banda de
brecha sólo existe donde las dos fuentes midieron.

### 2.b — Un conector que trae 0 filas no es "success" ✅

**Problema.** `scraper/labrecha_scraper/base.py` marcaba `success` sin mirar `rows_upserted`.

**Hecho.** La clase base tiene `min_rows` (default 1) y `run_job` marca la corrida como `empty` —un
estado propio, distinto de `success` y de `error`— cuando trae menos filas que el mínimo, con el
motivo escrito en `error`. `official_gazette` y `congress_summaries` declaran `min_rows = 0`: son los
dos únicos conectores que legítimamente pueden no tener nada nuevo que traer. `/estado` pinta `empty`
en ámbar con su propio copy ("sin datos" + explicación), cuenta esas corridas en "con error o sin
datos", y `scrape-alert.sh` ya las tomaba como fallo porque filtra por `status = 'success'`.

El cruce de `implicit_fx_rate` dejó de exigir igualdad exacta de fecha: toma el último dato de
reservas anterior o igual a la fecha de base monetaria, con un tope de 15 días de rezago, y guarda en
`meta.reserves_date` qué día de reservas usó.

**Criterio de salida.** ✅ Un conector que no trae datos se ve ámbar en `/estado` y entra en la
alerta de Telegram.

### 2.c — Corridas zombi ✅

**Hecho.** `close_interrupted_runs` corre al arrancar cada job: marca como `error` (motivo:
interrumpida) las corridas del mismo `job_name` que sigan en `running` con más de 6 h de antigüedad.

**Criterio de salida.** ✅ `/estado` no tiene corridas "en curso" de días.

### 2.d — `/gaps` automático: no comparar peras con manzanas ✅

**Problema.** `_build_gap` ordenaba por valor crudo entre fuentes sin mirar la unidad.

**Hecho.** Las mediciones se leen con su `meta.unit`. Se compara la unidad con más fuentes (mínimo
dos); las mediciones en otra unidad o sin unidad declarada quedan afuera y se devuelven en
`excluded_sources` con el motivo, así que la exclusión se puede auditar. La respuesta expone la
`unit` comparada y `/brechas` la muestra junto a la fecha, con las descartadas debajo. Documentado en
`/metodologia`.

**Criterio de salida.** ✅ El ranking sólo compara mediciones de la misma unidad y las descartadas se
ven.

### 2.e — Vigencia visible de la escala de Ganancias ✅

**Problema.** `income_tax.py` tenía la escala y los mínimos hardcodeados, sin período de vigencia,
sin fuente y —además— mezclando dos períodos distintos: la escala del art. 94 era la del período
anual 2025 y las deducciones del art. 30 las del primer semestre de 2025.

**Hecho.** Escala + deducciones viven en un `IncomeTaxScale` con `effective_from`, `period_label`,
`source` y `source_url`, y todos los importes se actualizaron al período vigente (julio a diciembre
de 2026, importes acumulados a diciembre), verificados contra los PDF de ARCA del art. 94 y del
art. 30 más el tope de seguro de vida de las deducciones generales 2026. La respuesta de la
calculadora devuelve esa metadata en `scale` y `/calculadora-sueldo-neto` la renderiza con el patrón
de atribución (período + fecha de vigencia + link a la fuente). `isTaxScaleOutdated`
(`lib/freshness.ts`, 185 días) dispara solo el aviso de "puede haber una actualización posterior;
verificá contra ARCA".

**Criterio de salida.** ✅ La calculadora dice de qué período es su escala y de dónde salió; una
escala vencida se avisa sola.

### 2.f — Rebase de las series deflactadas ✅

**Problema.** `connectors/derived.py` tomaba como base el **último** mes de IPC, así que cada corrida
reescribía toda la serie real.

**Hecho.** Base fija: `DEFLATED_BASE_MONTH = 2024-12`, constante en el código. Si el IPC no tiene ese
mes, el conector no escribe nada (y con `min_rows` eso se ve como `empty`) en vez de rebasar a
ciegas. `meta.base_month` sigue grabándose y ahora la página del indicador lo muestra ("expresada en
pesos de diciembre de 2024, base fija, deflactada por el IPC nivel general"). La decisión quedó
escrita en `/metodologia`.

**Criterio de salida.** ✅ Toda serie `*_real` dice en qué pesos está expresada.

---

## Fase 3 — Superficies muertas ✅ HECHA (2026-07-26)

**Desvío respecto de lo planificado.** Además de recortar el precache a rutas que existen, el
`install` dejó de ser atómico: cada asset se cachea con `cache.add` dentro de un `Promise.allSettled`,
así que un 404 futuro degrada el offline de ese recurso en vez de tumbar la instalación entera. Era el
mecanismo del bug, no sólo la lista.

### 3.a — El service worker nunca se instala ✅

**Problema.** `web/public/sw.js` precacheaba rutas de la era FinArg (`/login`, `/register`,
`/bandas-cambiarias`, `/comparador-tasas`, `/cotizaciones`, `/inflacion`, `/reservas-bcra`) que no
existen. `cache.addAll` es atómico: un 404 rechazaba la promesa y el evento `install` fallaba → el
PWA/offline no funcionaba desde el pivot, y el error sólo se veía en dev porque `lib/logger.ts`
silencia todo en producción.

**Hecho.**

- El precache quedó en rutas y estáticos que existen: `/`, `/indicadores`, `/brechas`,
  `/calculadoras`, el manifest y los iconos. Verificado con la build de producción levantada: las
  ocho URLs devuelven 200, sin redirects.
- `install` usa `cache.add` + `Promise.allSettled` en vez de `cache.addAll`.
- Se borraron los handlers `sync` (llamaba a `syncSimulations`, que no existe en ningún lado),
  `push` y `notificationclick`: la app no envía notificaciones. Si en la fase 6 aparecen las alertas,
  se reponen con el flujo real.
- El `/api/` dejó de usar `staleWhileRevalidate`: con esa estrategia el SW servía su copia vieja
  antes de la red, pisando los TTL de `lib/cacheRules.ts` y sin el aviso de frescura. Ahora cae en
  `networkFirst`: online siempre trae el dato del BFF, offline sirve lo último que vio. Se fue el
  `API_CACHE` con eso.
- `CACHE_VERSION` a `v5` para invalidar lo que haya quedado cacheado.

**Criterio de salida.** ✅ El SW no tiene ninguna URL que devuelva 404 en el precache y su `install`
ya no puede fallar por un recurso faltante.

### 3.b — Manifest apuntando a rutas viejas ✅

**Hecho.** Los accesos directos apuntan a `/indicador/dollar_blue`, `/calculadora-sueldo-neto` y
`/indicador/cpi_monthly` (los dos primeros pasaban por los 301 de `next.config.js`). Verificado:
los tres devuelven 200 directo.

**Criterio de salida.** ✅ Ningún shortcut del manifest pasa por un redirect.

---

## Fase 4 — Seguridad e infraestructura (4.a y 4.b hechas, 2026-07-26)

Las dos que cierran agujeros reales de seguridad están hechas. Las otras dos quedaron **decididas y
pendientes, no olvidadas**: 4.c porque el usuario prefiere seguir usando su suscripción vía el CLI
del host, y 4.d porque implica una cuenta externa y una dependencia nueva.

### 4.a — El rate limit de la API es cosmético ✅

**Problema.** `rate_limit.py` tomaba el primer elemento de `X-Forwarded-For`, y el nginx usa
`$proxy_add_x_forwarded_for`, que **preserva y antepone el header que mandó el cliente**: cualquiera
mandaba un XFF aleatorio por request y salteaba el limitador entero.

**Hecho.** Tres capas, de afuera hacia adentro:

- El nginx del server de este sitio (sólo `location /` y `/api/data/`, sin tocar los otros sitios del
  archivo compartido) manda `X-Forwarded-For $remote_addr` en vez de `$proxy_add_x_forwarded_for`,
  así que el header deja de arrastrar lo que mandó el cliente.
- El BFF (`app/api/data/[...path]/route.ts`) reenvía a la FastAPI tanto `x-real-ip` como
  `x-forwarded-for` (antes sólo el segundo).
- `client_key` prefiere `X-Real-IP` —que el nginx sobrescribe siempre— y, si no está, toma el
  **último** hop del XFF, que es el que agregó el proxy. La exención de la red interna se conserva
  para que el SSR no se auto-limite.

**Tests.** `api-py/tests/test_rate_limit.py` (9): el `X-Real-IP` le gana a un XFF forjado, el último
hop es el confiable, 100 XFF distintos desde la misma IP colapsan en **una** clave, la red interna
sigue exenta, y los bordes del contador de ventana deslizante.

**Criterio de salida.** ✅ Cien requests con `X-Forwarded-For` distintos desde la misma IP comparten
la misma clave del limitador, así que dan 429.

### 4.b — Endurecer el admin ✅

**Problema.** El token de sesión era un HMAC fijo de la password: no expiraba, no se podía revocar sin
cambiar la password, y `/api/admin/session` no tenía límite de intentos (brute-forceable desde
internet).

**Hecho.**

- El token pasó a ser `<expiresAt>.<hmac(password, payload+expiresAt)>` con TTL real de 7 días
  (`SESSION_TTL_SECONDS`), verificado contra el reloj además de la firma: estirar el `expiresAt` sin
  re-firmar no valida, y el `Max-Age` de la cookie dejó de ser la única defensa. El payload subió a
  `v2`, así que las sesiones viejas se invalidan solas con el deploy.
- Límite de intentos por IP en el route handler (`lib/loginAttempts.ts`): 5 fallidos en 15 minutos →
  429 con `Retry-After`; un login exitoso limpia el contador. La IP sale de `lib/clientIp.ts`, que
  usa el mismo criterio que la API (`x-real-ip`, si no el último hop del XFF), así que un XFF forjado
  no multiplica los buckets.

**Tests.** 16 nuevos: expiración del token, `expiresAt` estirado sin re-firmar, tokens mal formados,
cambio de password que invalida todo, bordes del límite de intentos y no-contaminación entre IPs.
`jest.setup.ts` ahora guarda los mocks de browser detrás de un `typeof window`, para que las suites
que necesitan el entorno `node` (las que construyen un `NextRequest`) puedan correr.

**Criterio de salida.** ✅ N intentos fallidos bloquean temporalmente y una sesión vieja deja de valer
sin tocar la password.

### 4.c — El LLM deja de depender del CLI del host ⏸️ decidido no hacerlo (por ahora)

**Estado.** Se implementó la migración al SDK de Anthropic (API key por env, timeout y reintentos
explícitos, manejo de `stop_reason: refusal`) y se revirtió a pedido del usuario: la suscripción
que paga los conectores con IA vive en el CLI del host, y pasar a la API sería pagar tokens aparte.
El `llm.py` sigue invocando el binario `claude` por `subprocess` y el `docker-compose.prod.yml`
sigue montando el binario y las credenciales OAuth del usuario `deploy`.

**Costo de la decisión, para que esté escrito:** el conector con IA sigue atado a un host con el CLI
instalado y autenticado, y el contenedor del scraper conserva el set de caps default de Docker por
eso mismo. Si algún día se rota la cuenta del host o se cambia de VPS, esto se rompe en silencio
hasta que `/estado` muestre el conector en rojo.

### 4.d — Observabilidad ⏸️ pendiente

**Estado.** Postergada a pedido del usuario: requiere una cuenta externa (Sentry o equivalente), su
DSN, una dependencia nueva en `web` y en `api-py`, y sumar el host del colector al `connect-src` del
CSP. Sigue en pie el problema: `lib/logger.ts` no hace nada en producción, así que un error de render
en prod es invisible salvo que un usuario avise.

---

## Fase 5 — SEO y distribución ✅ HECHA (2026-07-26)

**Desvío respecto de lo planificado.** El sitemap se hizo **a prueba de datos raros**, no sólo
completo: probándolo contra la api-py vieja que está levantada en local (devuelve `acta_id` en vez de
`vote_record_id`) generó **300 URLs `/congreso/votacion/undefined`** idénticas. Es exactamente el tipo
de bug que hay que atrapar antes de mandárselo a Google, así que las rutas dinámicas ahora filtran los
registros sin slug/id usable y el sitemap deduplica por path.

### 5.a — Sitemap completo ✅

**Problema.** `web/src/app/sitemap.ts` no incluía `/ideas/[slug]` —las únicas páginas editoriales del
sitio—, ni `/congreso/votacion/[id]`, `/boletin.xml`, `/brechas.xml` o los `feed.xml` por indicador.

**Hecho.** El sitemap pasó a ser `async` y lee las rutas dinámicas de la API con las mismas factorías
de `lib/queries.ts` que usan las páginas (así respeta los TTL de `lib/cacheRules.ts` y comparte caché
con el resto del SSR): ideas publicadas (`/posts`, hasta 200) y votaciones (`/congress/votes`, las
últimas 300 — el endpoint ordena por fecha desc y topea en 500). Suma los tres RSS y un `feed.xml` por
indicador. Si la API no responde, cada bloque cae a lista vacía y el sitemap sigue publicando las
rutas estáticas en vez de romper el build.

**Verificado** con la build de producción levantada: 141 URLs con la API local vieja (0 `undefined`, 0
duplicados) y, contra un stub que devuelve las formas correctas, aparecen
`/ideas/el-precio-del-dolar` y `/congreso/votacion/4321`. `/sitemap.xml` tiene ISR de 1 minuto.

**Criterio de salida.** ✅ Cada idea publicada aparece en el sitemap el día que se publica.

### 5.b — Metadata por indicador con el número adentro ✅

**Problema.** `generateMetadata` de `/indicador/[code]` armaba una description genérica, sin último
valor ni fecha.

**Hecho.** `lib/seoDescriptions.ts` (helpers puros, con tests) arma las dos descriptions:

- `indicatorDescription` — "Dólar blue: $ 1.521 al 25/07/2026 según DolarAPI. […] Comparado con
  Argentina Datos para ver la brecha entre mediciones." La unidad se pega al número sólo cuando el
  formateador no la trae ya (`%`, `pb`, `pts`; no `ARS`/`USD`, que salen como `$`/`US$`), y si la serie
  no tiene datos o el valor no parsea cae a la description genérica en vez de escribir `NaN`.
- `gapsDescription` — encabeza `/brechas` con la discrepancia más grande de hoy, sus dos fuentes y su
  fecha, más cuántos indicadores tienen más de una fuente.

**Verificado** end-to-end contra un stub: `/indicador/[code]` es dinámico (`ƒ`), así que la cifra se
calcula por request. `/brechas` es estático con ISR de 30 minutos: en el build del CI la API no es
alcanzable, así que sale con la description genérica y se corrige sola en la primera revalidación en el
VPS.

**Criterio de salida.** ✅ El snippet muestra la cifra vigente con su fuente y su fecha.

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
