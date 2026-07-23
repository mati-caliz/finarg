# Rediseño "Editorial" — roadmap de migración

Rediseño completo del frontend a la nueva dirección **editorial / periodística de datos**
generada en Claude Design (proyecto `Design system home página 1c`,
`f7019ab4-cb96-4012-a418-63370a700022`). Reemplaza la dirección anterior "Observatorio claro".

Archivos de diseño de referencia (leer con la MCP de Claude Design, uno por pantalla):
`Home`, `Indicador`, `Indicadores`, `Brechas`, `Ideas`, `Idea`, `Congreso`, `Noticias`,
`Calculadoras`, `Feriados`, `Mobile` (Home + Indicador + Idea en celular),
`Exploración tipográfica`.

## Design system (extraído de los mocks)

### Tipografías

Tres roles, cada uno con su familia (todas en Google Fonts):

- **Bricolage Grotesque** — display y titulares. Pesos 400/600/700/800. Tracking apretado
  (`-0.02em` a `-0.03em`). Variable CSS: `--font-display`.
- **Newsreader** — cuerpo y prosa larga (bajadas, artículos de ideas). Pesos 400/500/600 +
  itálica. Variable CSS: `--font-serif`.
- **JetBrains Mono** — todos los números, chips de fuente, eyebrows, labels y micro-copy de
  UI. Pesos 400/500/600/700, `tabular-nums`, mayúsculas con tracking. Variable CSS:
  `--font-jb-mono`.

Regla de oro: **ningún número va en serif ni en sans**; siempre mono tabular.

### Paleta (tokens oklch, light + dark)

Definida en `globals.css` (bloque "Design system v2"). Nombres semánticos:

- Superficies: `--paper` (fondo), `--surface` (secciones tenues), `--raise` (cards).
- Tinta: `--ink` / `--ink2` / `--ink3` (primario / secundario / terciario).
- Líneas: `--line` / `--line2`.
- **`--brecha`** (naranja quemado) = discrepancia entre fuentes. Con `--brecha-bg` y
  `--brecha-ln`. **Es la feature estrella: color propio e inconfundible.**
- **`--evento`** (violeta) = eventos políticos en las series. Con `--evento-bg` / `--evento-ln`.
- `--pos` (verde) / `--neg` (rojo) para variaciones, con sus `-bg`.
- `--chart` (azul) + `--chart-fill` para líneas y áreas de gráficos.

### Layout y ritmo

- Ancho máximo `1200px` centrado. **Top-nav sticky** (blur + borde inferior), **sin sidebar**.
- Headers de sección: eyebrow mono "Sección 0N" + `<h2>` Bricolage + regla inferior 2px `--ink`.
- Cards: fondo `--raise`, borde 1px `--line`, radio 8px.
- Panel de brecha: fondo `--brecha-bg`, borde `--brecha-ln`, eyebrow "◆ La brecha entre fuentes".
- Anotación de eventos en gráficos: línea vertical violeta punteada + pill con label.
- Atribución (regla dura de producto): patrón mono `● FUENTE · fecha`, como pill con borde
  `--line` radio 100px, o como caption inline. **En cada número, gráfico y tabla.**

## Fases

### Fase 0 — Fundaciones ✅ (hecho)

- `layout.tsx`: alta de las 3 fuentes (Bricolage Grotesque, Newsreader, JetBrains Mono).
- `globals.css`: bloque de tokens "Design system v2" (light + dark), coexistiendo con los
  tokens actuales para no romper las pantallas viejas durante la migración.

### Fase 1 — Shell de navegación ✅ (hecho)

- `SiteHeader.tsx`: header top-nav (marca + punto ámbar, links El país / Indicadores / Brechas /
  Ideas / Congreso / Noticias, fecha, buscador ⌘K, café, toggle de tema, menú hamburguesa mobile).
- `SiteFooter.tsx`: footer editorial (marca, secciones, fuentes).
- `layout.tsx`: se sacó `Sidebar` + `Navbar` + `lg:pl-64`; shell nuevo con `--paper`/`--ink` y
  `--font-serif`. Se mantienen `CommandPalette` (⌘K) y `CafecitoModal`.
- Los componentes viejos `Navbar.tsx` / `Sidebar.tsx` quedaron sin uso (borrar en Fase 4).
- **Transición:** las pantallas aún no portadas se renderizan dentro del shell nuevo pero con su
  estilo viejo y sin el gutter del `main` anterior; se corrigen al portarlas en Fase 3.

### Fase 2 — Componentes core (`src/components/core/`)

Re-skin/port a los tokens nuevos, con variantes según los mocks:

- `SourceChip` (pill mono + caption inline) — patrón de atribución.
- `VariationBadge` (▲/▼ con `--pos`/`--neg`, y variante `◆ brecha X%` en `--brecha`).
- `IndicatorTile`: variante **hero** (número 60px + gráfico anotado) y **compacta** (2×2, con
  sparkline).
- `Sparkline` y `AnnotatedSeriesChart` (Recharts) con marcadores de evento (línea punteada
  violeta + pill) y línea/área azul.
- **Comparador de brecha**: panel con número grande `--brecha` + filas por fuente.
- `DataTable` mono tabular.
- `IdeaCard` (badge de estado idea/borrador/propuesta, categoría, país de inspiración) +
  `ImpactCards` (grilla 2×2 de impacto estimado).
- `SectionHeader` (eyebrow + h2 + regla) y `StatBlock` (para el hero de la home).

### Fase 3 — Pantallas (cada una wired a hooks reales, verificada corriendo la app)

Orden sugerido (mayor impacto primero):

1. **Home** ✅ (hecho) — `page.tsx` compone `HomeHero` + `EstadoPais` + `BrechasTeaser` +
   `IdeasHome` (todos wired a hooks reales; helpers en `homeShared.tsx`). Reemplaza la grilla
   de ~15 cards (relojes/termómetros), que quedan sin uso para decidir en Fase 4. Pendiente:
   revisar visualmente con el stack corriendo y afinar (stats del hero, mapeo de eventos).
2. **Indicador** (`/indicador/[code]`) ✅ (hecho) — `IndicatorDetail` reescrito al diseño nuevo
   preservando toda la lógica de datos: breadcrumb + número grande + variación, chips de fuente,
   selector de rango, gráfico multi-fuente anotado con eventos, **panel de brecha** (con % real,
   valores por fuente y metodología), 3 tarjetas de variación (reciente/mensual/interanual
   calculadas de la serie), brechas relacionadas y tabla de datos temporal con export CSV.
3. **Ideas feed** (`/ideas`) ✅ (hecho) — `PostsFeed` reescrito: filtros por categoría real,
   idea destacada (lead) + grilla de cards con badge de categoría, resumen, chips de impacto y
   fecha. Header editorial en `page.tsx`.
4. **Idea detalle** (`/ideas/[slug]`) ✅ (hecho) — `PostDetail` reescrito a artículo editorial
   (ancho 720): breadcrumb, badge, título display, bajada serif, meta, tarjetas de impacto,
   cuerpo markdown con tipografía nueva, atribución y "Seguir leyendo" (posts relacionados).
   Nota: el mock mostraba "estado", "país de inspiración", "imagen destacada" y un bloque
   estructurado "Cómo lo hace X" que **no existen en los datos** (los posts tienen
   category/summary/content/impacts); no se fabricaron. El bloque "Cómo lo hace X" vive como
   prosa dentro del markdown del post.
5. **Indicadores** (`/indicadores`) ✅ (hecho) — `IndicatorCatalog` reescrito: buscador + filtro
   por familia, secciones por familia con grilla de cards (label, code, chips de fuente, badge
   ◆ comparador, cantidad + última fecha + stale). Cards livianas (metadata, sin 48 fetches de
   serie); el valor/sparkline por card queda como mejora opcional futura.
6. **Brechas** (`/brechas`) ✅ (hecho) — hero band ámbar + `BrechaRankList` (lista rankeada por
   magnitud con barra de brecha, datos reales vía `useLegLatest`) + `BrechaComparison` reescrito
   a editorial (gráfico dual con banda de brecha y eventos) para el detalle de cada brecha.
7. **Congreso** (`/congreso` + `/congreso/votacion/[actaId]`) ✅ (hecho) — header editorial +
   `VotesBoard` (ficha destacada de la última votación con barras por bloque + lista de recientes,
   componente de barras compartido `VoteBars`) y `VoteDetail` reescrito a editorial (tally +
   voto por bloque). Se conservan abajo Senado/Diputados/leyes/asistencia con headers editoriales
   (internos aún con estilo viejo, transicional). `LatestVotes.tsx` quedó sin uso (borrar Fase 4).
8. **Noticias** (`/noticias`) ✅ (hecho) — `NewsFeed` reescrito: lead editorial + lista + sidebar
   ("Más titulares" + "Fuentes agregadas" derivadas de los datos), todo con enlace a la fuente.
9. **Calculadoras** (4) ✅ (parcial) — header editorial compartido (`CalculatorHeader`) + contenedor
   con padding en las 4. **Los formularios/resultados internos siguen con Card viejo** (transicional,
   pulir en Fase 4). Sin índice de calculadoras: se accede por el link del footer + ⌘K.
10. **Feriados** (`/feriados`) ✅ (hecho) — `HolidaysCalendar` reescrito: hero con **countdown en
    vivo** al próximo feriado + lista editorial con badge Inamovible/Trasladable (de `is_fixed`) y
    finde largo. Se reemplazó la grilla de 12 meses por la lista (más fiel al diseño nuevo).

### Fase 4 — Limpieza ✅ (parcial)

- ✅ Re-skin de los primitivos core `Card` / `Button` / `Badge` / `DataTable` a tokens+tipografías
  v2 (lifta calculadoras y secciones secundarias de Congreso que los usan).
- ✅ Header editorial compartido en las 4 calculadoras.
- ✅ Borrados componentes muertos: `Navbar`, `Sidebar`, `LatestVotes` y los ~16 cards viejos de la
  home (relojes/termómetros/impuestómetros/`IndicatorTileConnected`).
- ✅ Sección "Sistema de diseño" de `CLAUDE.md` actualizada a la dirección editorial.
- **Pendiente:** revisar todo corriendo el stack (nada verificado visualmente); re-skin fino de los
  **formularios internos** de las 4 calculadoras y de las secciones secundarias de Congreso
  (Senado/Diputados/leyes/asistencia) que aún usan estilos viejos; eliminar los **tokens viejos** de
  `globals.css` cuando ninguna pantalla los use y renombrar el bloque v2 al set definitivo; evaluar
  un **índice de calculadoras** o entrada de nav. Core sin uso tras la limpieza (`IndicatorTile`,
  `Sparkline`, `VoteBar`/`VoteCard`, `LiveCounter`): borrar cuando se confirme.

## Notas

- Verificación por fase (en `web/`): `npx tsc --noEmit`, `npm run lint:check`, `npm run build`,
  y correr la app para revisar cada pantalla.
- Sin comentarios en el código, tipado estricto, `===`, nombres semánticos (reglas del repo).
- Commits descriptivos en español, directo a `main`.
