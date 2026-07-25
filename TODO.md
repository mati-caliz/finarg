# TODO La Brecha

Ideas para después del MVP. Lo que se descartó en el pivot desde FinArg (otros países, sistema de
usuarios, monetización por suscripción, módulo de inversiones) no vuelve a esta lista: está en
`ROADMAP.md` con el motivo de la baja.

## Datos e indicadores

- [ ] **Salarios promedio por sector**: hoy están RIPTE y el índice de salarios, falta la
      apertura por rama de actividad.
- [ ] **Reservas netas**: ni el BCRA ni datos.gob.ar las publican (es una estimación de
      analistas: brutas menos swap, encajes en dólares, repos y BIS). Requiere elegir y
      documentar una metodología propia, o citar una consultora como fuente.
- [ ] **Tablero de riesgo país y bonos**: spreads, rendimientos y ratings.
- [ ] **Calendario económico**: fechas de publicación (IPC, PBI, tasas, EMAE).
- [ ] **Índice de paridad de poder adquisitivo regional**: costo de vida comparado entre provincias.

## Producto

- [ ] **Alertas por email**: hoy el aviso de brechas es por RSS; el email necesita SMTP,
      almacenamiento de suscriptores y doble opt-in.
- [ ] **Variación desde un evento puntual** (no sólo por mandato): p. ej. desde el DNU 70/2023.

## Herramientas

- [ ] **Calculadora de poder de compra histórico**: cuánto valía una suma en el pasado vs. hoy.
- [ ] **Conversor de monedas**: conversión con las cotizaciones ya ingeridas.
- [ ] **Simulador de inversiones**: proyección de carteras en el tiempo.

## Calidad

- [ ] **Tests de la lógica de plata**: `income_tax.py` y `tax_impact.py` no tienen tests.
- [ ] **Correr los tests en CI**: los de Jest existen pero no los ejecuta nadie; el CI además sólo
      dispara en pull request y los commits van directo a `main`.
- [ ] **UX 2.0**: repaso general de la experiencia.
