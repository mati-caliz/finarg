-- Renombra los indicator_code de español a inglés, tolerando que el scraper nuevo ya
-- haya escrito filas con el nombre nuevo (que es el estado real de producción: las
-- series quedaron partidas en dos, el histórico bajo el nombre viejo y los datos
-- recientes bajo el nuevo).
--
-- Reemplaza a migrate-indicator-codes-english.sql, que asumía que no habia colisiones
-- y hoy violaria uq_indicator_source_date.
--
--   docker compose -f docker-compose.prod.yml exec -T postgres \
--     sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < scripts/merge-indicator-codes-english.sql

BEGIN;

CREATE TEMP TABLE code_rename (old_code text PRIMARY KEY, new_code text NOT NULL)
  ON COMMIT DROP;

INSERT INTO code_rename (old_code, new_code) VALUES
  ('base_monetaria', 'monetary_base'),
  ('big_mac_valuacion', 'big_mac_valuation'),
  ('cba_nacional', 'basic_basket_national'),
  ('confianza_gobierno', 'government_confidence'),
  ('cripto_ada', 'crypto_ada'),
  ('cripto_bnb', 'crypto_bnb'),
  ('cripto_btc', 'crypto_btc'),
  ('cripto_eth', 'crypto_eth'),
  ('cripto_sol', 'crypto_sol'),
  ('cripto_xrp', 'crypto_xrp'),
  ('desempleo', 'unemployment'),
  ('dolar_blue', 'dollar_blue'),
  ('dolar_bolsa', 'dollar_mep'),
  ('dolar_contadoconliqui', 'dollar_ccl'),
  ('dolar_cripto', 'dollar_crypto'),
  ('dolar_mayorista', 'dollar_wholesale'),
  ('dolar_oficial', 'dollar_official'),
  ('dolar_solidario', 'dollar_solidario'),
  ('dolar_tarjeta', 'dollar_card'),
  ('empleo_asalariado_privado', 'private_wage_employment'),
  ('empleo_asalariado_publico', 'public_wage_employment'),
  ('empleo_casas_particulares', 'domestic_workers_employment'),
  ('empleo_independiente_autonomo', 'self_employed_autonomous'),
  ('empleo_independiente_monotributo', 'self_employed_monotax'),
  ('empleo_independiente_monotributo_social', 'self_employed_social_monotax'),
  ('empleo_no_registrado', 'informal_employment'),
  ('expectativas_inflacion_rem', 'inflation_expectations_rem'),
  ('gasto_capital', 'capital_expenditure'),
  ('gasto_corriente', 'current_expenditure'),
  ('indice_salarios', 'wage_index'),
  ('ipc_interanual', 'cpi_yoy'),
  ('ipc_mensual', 'cpi_monthly'),
  ('ipc_nivel_general', 'cpi_level_general'),
  ('pobreza_personas', 'poverty_persons'),
  ('prestamos_sector_privado', 'private_sector_loans'),
  ('produccion_industrial', 'industrial_production'),
  ('recaudacion_tributaria', 'tax_revenue'),
  ('reservas_internacionales', 'international_reserves'),
  ('resultado_financiero', 'financial_balance'),
  ('resultado_primario', 'primary_balance'),
  ('riesgo_pais', 'country_risk'),
  ('salario_minimo', 'minimum_wage'),
  ('subsidios_energia', 'energy_subsidies'),
  ('subsidios_transporte', 'transport_subsidies'),
  ('tasa_adelantos_cuenta_corriente', 'rate_overdraft'),
  ('tasa_plazo_fijo', 'rate_time_deposit'),
  ('tasa_prestamos_personales', 'rate_personal_loans'),
  ('tasa_tamar', 'rate_tamar'),
  ('tributos_municipales', 'taxes_municipal'),
  ('tributos_nacionales', 'taxes_national'),
  ('tributos_provinciales', 'taxes_provincial'),
  ('tributos_total', 'taxes_total');

-- Donde el mismo (fuente, fecha) ya existe con el nombre nuevo, el dato viejo y el
-- nuevo son la misma medicion: se descarta la copia nueva y se conserva el historico.
DELETE FROM indicator_history recent
USING code_rename r, indicator_history historic
WHERE recent.indicator_code = r.new_code
  AND historic.indicator_code = r.old_code
  AND historic.source = recent.source
  AND historic.date = recent.date;

UPDATE indicator_history h
SET indicator_code = r.new_code
FROM code_rename r
WHERE h.indicator_code = r.old_code;

COMMIT;
