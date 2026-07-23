# Rediseño completo de "La Brecha" — observatorio político-económico de Argentina

## Qué es el producto

**La Brecha** (labrecha.ar) es un observatorio público de Argentina, solo lectura, sin login.
Tiene **dos pilares con el mismo peso**, y el rediseño tiene que hacerlos brillar a ambos:

1. **Informar**: reúne indicadores político-económicos dispersos (INDEC, BCRA, datos.gob.ar,
   consultoras, Congreso) en un solo lugar, con dos features definitorias:
   - **La brecha entre mediciones**: un mismo indicador medido por fuentes distintas
     (reservas según BCRA vs datos.gob.ar; inflación oficial vs esperada). Mostrar la
     discrepancia ES la feature. El nombre juega con el doble sentido: brecha cambiaria +
     brecha entre mediciones.
   - **Series anotadas con eventos políticos**: elecciones, cambios de gobierno, DNUs
     marcados sobre la misma línea de tiempo que la serie económica.
2. **Ideas**: el autor publica propuestas concretas para Argentina inspiradas en lo que
   funciona en otros países (leyes, políticas públicas, análisis comparados). Cada idea
   puede mostrar impacto estimado (tiempo, plata, ambiente, vidas, transparencia) y estado
   (idea → borrador → propuesta). Hoy esta sección parece un apéndice; en el rediseño tiene
   que ser un pilar co-protagonista, no un blog escondido.

Audiencia: público general argentino que quiere entender el país sin ser economista, más
periodistas y nerds de datos. Tono: serio y confiable pero no académico ni frío.

## Qué está mal hoy (por qué rediseñamos de cero)

El diseño actual ("Observatorio claro": paleta papel/tinta, azul institucional, ámbar para
brechas, Archivo + IBM Plex Mono) tiene estos problemas — resolvelos todos:

- **Sobrecargado**: la home es una grilla de ~15 cards (relojes de inflación, termómetros,
  impuestómetros) sin jerarquía. Todo grita a la vez, nada se destaca.
- **Estética genérica**: parece un dashboard admin cualquiera. Cero personalidad.
- **No comunica el propósito**: entrás y no entendés qué es esto ni por qué importa.
- **Las Ideas están escondidas**: parecen una sección secundaria.

## Dirección estética pedida

**Editorial / periodístico de datos.** Referencias: The Pudding, Financial Times (data
journalism), Reuters Graphics, La Nación Data. Concretamente:

- Tipografía protagonista: titulares grandes con carácter, jerarquía editorial clara.
- **Antes de diseñar pantallas, proponé 2-3 pares tipográficos distintos** (titular +
  texto + mono para números), cada uno con un mini specimen aplicado a un fragmento real
  del sitio (un titular de idea, un indicador con su número, un chip de fuente) para poder
  elegir. Que las opciones tengan personalidades distintas entre sí (p. ej. una serif
  editorial clásica, una grotesca contemporánea, una con más carácter/display). Todas
  disponibles en Google Fonts y con buen soporte de español.
- Gráficos grandes y narrativos como piezas centrales, no thumbnails en cards.
- Ritmo de lectura tipo diario: una historia principal, secundarias, no grilla uniforme.
- Números en mono tabular; formato argentino (1.234,56).
- Podés proponer paleta nueva desde cero, no estás atado a la actual. Conservá una sola
  cosa conceptual: las **discrepancias entre fuentes** necesitan un color de acento propio
  e inconfundible (hoy es ámbar), y los **eventos políticos** otro (hoy violeta).
- Light y dark mode.

## La home: mitad y mitad

La home debe balancear los dos pilares como dos secciones fuertes y diferenciadas:

- **"El estado del país"**: 4-6 indicadores clave máximo (no 15), con jerarquía: uno o dos
  héroes con gráfico grande anotado, el resto compacto. Link a la vista completa.
- **"Ideas"**: las últimas propuestas con tratamiento editorial (título fuerte, bajada,
  impacto estimado, estado), no cards genéricas de blog.
- Arriba de todo, algo que en 5 segundos comunique qué es La Brecha y por qué existe.

## Pantallas a diseñar (todas)

1. **Home** (según lo de arriba).
2. **Indicador individual** (`/indicador/[code]`): serie temporal grande anotada con eventos
   políticos + comparador de fuentes (la brecha entre mediciones, la feature estrella:
   diseñale un tratamiento visual memorable), variaciones (diaria/mensual/interanual),
   tabla de datos.
3. **Índice de indicadores** (`/indicadores`): catálogo navegable por categoría.
4. **Brechas** (`/brechas`): vista dedicada a todas las discrepancias entre fuentes,
   ordenadas por magnitud de la brecha.
5. **Ideas — feed** (`/ideas`): lista editorial de propuestas con categoría, estado
   (idea/borrador/propuesta), impacto estimado (tiempo/plata/ambiente/vidas/transparencia)
   y país de inspiración.
6. **Idea — detalle** (`/ideas/[slug]`): lectura larga tipo artículo, con bloque destacado
   de "cómo lo hace [país X]" y cards de impacto estimado integradas al texto.
7. **Congreso** (`/congreso` y detalle de votación): votaciones nominales de Diputados con
   barras de votos por bloque, ficha de cada votación.
8. **Noticias** (`/noticias`): agregador de titulares con fuente.
9. **Calculadoras** (sueldo neto, ajuste por inflación, interés compuesto, impacto fiscal):
   formulario + resultado, mismo lenguaje visual.
10. **Feriados** (`/feriados`): próximos feriados, contador al siguiente.

## Reglas duras (no negociables)

- **Todo dato lleva fuente + fecha visibles** (requisito legal con algunas fuentes). La
  atribución es parte del diseño, no un footnote: diseñá el patrón (chip, byline, lo que
  propongas) y usalo consistentemente en cada número, gráfico y tabla.
- Responsive real: mucha lectura va a ser en celular.
- Stack de implementación: Next.js + Tailwind + Recharts (que los gráficos propuestos sean
  realizables con Recharts).

## Entregables (en este orden)

1. **Exploración tipográfica**: los 2-3 pares con sus especímenes, para elegir uno antes
   de seguir.
2. **Design system**: paleta (light + dark), el par tipográfico elegido, espaciado, tokens.
3. **Componentes core**: tile de indicador, sparkline, badge de variación, chip de fuente,
   gráfico de serie anotada con eventos, comparador de brecha entre fuentes, barra de
   votación, tabla de datos, card de idea, cards de impacto, navegación.
4. **Las 10 pantallas** en desktop, y las 3 principales (home, indicador, idea detalle)
   también en mobile.

Empezá por la exploración tipográfica y frená ahí hasta que elija una; después seguí con
design system y home, y el resto deriva de ahí.
