# Prompt de diseño — La Brecha

Prompt listo para mandar a Claude (claude.ai, donde genera Artifacts) y diseñar la app desde cero.
Copiá y pegá todo el bloque de abajo.

---

Sos un diseñador de producto senior. Quiero que diseñes desde cero la interfaz de una
web app llamada "La Brecha": un observatorio de métricas político-económicas de Argentina.
Necesito un sistema de diseño + las pantallas clave, como mockups navegables (HTML/React
autocontenido, con datos de ejemplo realistas).

## Qué es el producto
Un sitio público, de solo lectura, que reúne indicadores económicos y políticos argentinos
que hoy están dispersos en PDFs, portales estatales incómodos e informes de consultoras. Dos
diferenciales que el diseño DEBE hacer brillar:
1. "La brecha entre mediciones": un mismo indicador medido por fuentes distintas (ej. reservas
   del BCRA vs datos.gob.ar; inflación oficial vs esperada). Mostrar la discrepancia es LA feature.
2. Series temporales anotadas con eventos políticos (elecciones, cambios de gobierno, DNUs):
   cruzar lo económico con lo político sobre la misma línea de tiempo.

El nombre "La Brecha" tiene doble sentido: la brecha cambiaria (métrica clásica argentina) y la
brecha entre mediciones. El diseño puede jugar con eso.

## Usuarios
Periodistas, analistas, economistas, inversores minoristas y ciudadanos informados argentinos.
Gente que hoy abre 5 pestañas (INDEC, BCRA, Twitter de consultoras) y quiere una sola fuente clara.
Tono: serio, confiable, "data-first", nada sensacionalista. Cercano a un dashboard financiero /
a un medio de datos (piensa Bloomberg, Our World in Data, Cenital/Chequeado), no a una fintech.

## Datos reales disponibles (la API ya sirve esto; diseñá SOBRE esto, sin inventar)
- Indicadores en serie temporal: dólar (oficial/blue/MEP/CCL/tarjeta/cripto/mayorista), inflación
  mensual e interanual, riesgo país, reservas (diaria BCRA + mensual datos.gob.ar), base monetaria,
  recaudación, EMAE, canasta básica, RIPTE, índice de salarios, pobreza (semestral), desempleo,
  expectativas de inflación (REM), cripto. Cada indicador puede tener varias fuentes.
- Eventos políticos curados (fecha, título, categoría) para anotar las series.
- Congreso: votaciones nominales de Diputados (cabecera con resultado y tanteo + voto por diputado
  y bloque) y composición del Senado por bloque/provincia.
- Feriados, noticias económicas (título, fuente, fecha, imagen).
- Calculadoras: sueldo neto (Ganancias), interés compuesto, ajuste por inflación.

## Arquitectura de información que propongo (mejorala si ves algo mejor)
1. Home = "Estado del país": una grilla de tiles con los indicadores insignia (dólares, brecha
   cambiaria, inflación, reservas, riesgo país, pobreza, desempleo), cada uno con último valor,
   variación y un sparkline. Arriba, un resumen del "hoy".
2. Página por indicador: gráfico grande de la serie, anotado con eventos políticos; selector de
   rango; y cuando hay varias fuentes, el COMPARADOR (varias líneas + tabla de discrepancia) con
   metodología, fuente y disclaimer de cada medición.
3. Sección Congreso: composición del Senado (visual por bloque) y últimas votaciones de Diputados
   (lista con resultado y tanteo; detalle con el voto de cada bloque).
4. Calculadoras.
5. Noticias (secundario).

## Requisitos de diseño
- Sistema de diseño primero: paleta (light + dark, ambos obligatorios), tipografía, escala de
  espaciado, componentes base (tiles de indicador con sparkline, badge de variación +/-,
  gráfico de serie anotada, tabla de comparación de fuentes, tarjeta de votación, chips de fuente).
- Los gráficos son el corazón: cuidá especialmente la línea de tiempo anotada con eventos y la
  visualización de "brecha" entre 2+ series.
- Regla dura: SIEMPRE citar la fuente y fecha del dato visible (requisito legal con algunas fuentes).
  Un dato sin fuente no puede aparecer. Diseñá el patrón de atribución.
- Responsive real (mobile-first; las tablas y gráficos anchos scrollean en su contenedor).
- Español rioplatense. Contexto argentino (formato $ ARS, fechas dd/mm).
- Accesible (contraste AA en ambos temas; no depender solo del color para +/-).

## Stack donde se va a implementar (para que los mockups sean portables)
Next.js + React + TypeScript + Tailwind CSS + componentes tipo shadcn/ui + Recharts. No uses libs
externas por CDN en los mockups: todo inline.

## Entregables
1. Un tablero del sistema de diseño (colores, tipografía, componentes) en light y dark.
2. Mockup de la Home "Estado del país".
3. Mockup de una Página por indicador CON el comparador de fuentes y la serie anotada con eventos
   (usá reservas: BCRA 48.617 vs datos.gob.ar 44.516 USD millones como ejemplo real).
4. Mockup de la sección Congreso (composición del Senado + una votación con su tanteo).
Para cada pantalla: versión desktop y mobile, y una nota corta de las decisiones de diseño.

Empezá proponiendo el sistema de diseño y la dirección visual (2 opciones de dirección para que
elija), y seguí con las pantallas una vez que confirme la dirección.
