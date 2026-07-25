# TODO La Brecha

Ideas para después del MVP. Lo que se descartó en el pivot desde FinArg (otros países, sistema de
usuarios, monetización por suscripción, módulo de inversiones) no vuelve a esta lista: está en
`ROADMAP.md` con el motivo de la baja.

## Datos e indicadores

- [ ] **Evolución del salario mínimo**: histórico ajustado por inflación.
- [ ] **Evolución de las jubilaciones**: haberes y poder adquisitivo en el tiempo.
- [ ] **Salarios promedio por sector**: estadísticas por rama de actividad.
- [ ] **Reservas netas sin overrides**: hoy el valor mezcla fuentes; separar la serie neta propia.
- [ ] **Tablero de reservas vs. base monetaria**: relación entre reservas del BCRA y emisión.
- [ ] **Tablero de riesgo país y bonos**: spreads, rendimientos y ratings.
- [ ] **Calendario económico**: fechas de publicación (IPC, PBI, tasas, EMAE).
- [ ] **Índice de paridad de poder adquisitivo regional**: costo de vida comparado entre provincias.

## Producto

- [ ] **Variación desde un evento puntual** (no sólo por mandato): p. ej. desde el DNU 70/2023.
- [ ] **Semáforo público de frescura**: exponer por serie lo que ya calcula `lib/freshness.ts`.
- [ ] **API pública documentada**: la FastAPI ya es de sólo lectura; falta rate limiting y docs.
- [ ] **Alertas por email/RSS**: aviso cuando una brecha supera un umbral (sin cuentas de usuario).

## Herramientas

- [ ] **Calculadora de poder de compra histórico**: cuánto valía una suma en el pasado vs. hoy.
- [ ] **Conversor de monedas**: conversión con las cotizaciones ya ingeridas.
- [ ] **Simulador de inversiones**: proyección de carteras en el tiempo.

## Calidad

- [ ] **Tests de la lógica de plata**: `income_tax.py` y `tax_impact.py` no tienen tests.
- [ ] **Correr los tests en CI**: los de Jest existen pero no los ejecuta nadie; el CI además sólo
      dispara en pull request y los commits van directo a `main`.
- [ ] **UX 2.0**: repaso general de la experiencia.
