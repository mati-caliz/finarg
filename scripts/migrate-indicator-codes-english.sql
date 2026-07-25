-- Renombra los valores indicator_code de indicator_history a inglés.
-- Correr UNA vez contra prod (y local) EN EL MISMO deploy que el nuevo código:
--   el scraper y la web ya usan los nombres nuevos; hasta correr esto, los
--   gráficos de las series migradas quedan vacíos. Es idempotente por WHERE exacto.
--   docker compose -f docker-compose.prod.yml exec -T postgres \
--     sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < scripts/migrate-indicator-codes-english.sql

BEGIN;

UPDATE indicator_history SET indicator_code = 'monetary_base'                WHERE indicator_code = 'base_monetaria';
UPDATE indicator_history SET indicator_code = 'big_mac_valuation'            WHERE indicator_code = 'big_mac_valuacion';
UPDATE indicator_history SET indicator_code = 'basic_basket_national'        WHERE indicator_code = 'cba_nacional';
UPDATE indicator_history SET indicator_code = 'government_confidence'        WHERE indicator_code = 'confianza_gobierno';
UPDATE indicator_history SET indicator_code = 'crypto_ada'                   WHERE indicator_code = 'cripto_ada';
UPDATE indicator_history SET indicator_code = 'crypto_bnb'                   WHERE indicator_code = 'cripto_bnb';
UPDATE indicator_history SET indicator_code = 'crypto_btc'                   WHERE indicator_code = 'cripto_btc';
UPDATE indicator_history SET indicator_code = 'crypto_eth'                   WHERE indicator_code = 'cripto_eth';
UPDATE indicator_history SET indicator_code = 'crypto_sol'                   WHERE indicator_code = 'cripto_sol';
UPDATE indicator_history SET indicator_code = 'crypto_xrp'                   WHERE indicator_code = 'cripto_xrp';
UPDATE indicator_history SET indicator_code = 'unemployment'                 WHERE indicator_code = 'desempleo';
UPDATE indicator_history SET indicator_code = 'dollar_blue'                  WHERE indicator_code = 'dolar_blue';
UPDATE indicator_history SET indicator_code = 'dollar_mep'                   WHERE indicator_code = 'dolar_bolsa';
UPDATE indicator_history SET indicator_code = 'dollar_ccl'                   WHERE indicator_code = 'dolar_contadoconliqui';
UPDATE indicator_history SET indicator_code = 'dollar_crypto'                WHERE indicator_code = 'dolar_cripto';
UPDATE indicator_history SET indicator_code = 'dollar_wholesale'             WHERE indicator_code = 'dolar_mayorista';
UPDATE indicator_history SET indicator_code = 'dollar_official'              WHERE indicator_code = 'dolar_oficial';
UPDATE indicator_history SET indicator_code = 'dollar_card'                  WHERE indicator_code = 'dolar_tarjeta';
UPDATE indicator_history SET indicator_code = 'private_wage_employment'      WHERE indicator_code = 'empleo_asalariado_privado';
UPDATE indicator_history SET indicator_code = 'public_wage_employment'       WHERE indicator_code = 'empleo_asalariado_publico';
UPDATE indicator_history SET indicator_code = 'domestic_workers_employment'  WHERE indicator_code = 'empleo_casas_particulares';
UPDATE indicator_history SET indicator_code = 'self_employed_autonomous'     WHERE indicator_code = 'empleo_independiente_autonomo';
UPDATE indicator_history SET indicator_code = 'self_employed_monotax'        WHERE indicator_code = 'empleo_independiente_monotributo';
UPDATE indicator_history SET indicator_code = 'self_employed_social_monotax' WHERE indicator_code = 'empleo_independiente_monotributo_social';
UPDATE indicator_history SET indicator_code = 'informal_employment'          WHERE indicator_code = 'empleo_no_registrado';
UPDATE indicator_history SET indicator_code = 'inflation_expectations_rem'   WHERE indicator_code = 'expectativas_inflacion_rem';
UPDATE indicator_history SET indicator_code = 'capital_expenditure'          WHERE indicator_code = 'gasto_capital';
UPDATE indicator_history SET indicator_code = 'current_expenditure'          WHERE indicator_code = 'gasto_corriente';
UPDATE indicator_history SET indicator_code = 'wage_index'                   WHERE indicator_code = 'indice_salarios';
UPDATE indicator_history SET indicator_code = 'cpi_yoy'                      WHERE indicator_code = 'ipc_interanual';
UPDATE indicator_history SET indicator_code = 'cpi_monthly'                  WHERE indicator_code = 'ipc_mensual';
UPDATE indicator_history SET indicator_code = 'cpi_level_general'            WHERE indicator_code = 'ipc_nivel_general';
UPDATE indicator_history SET indicator_code = 'poverty_persons'              WHERE indicator_code = 'pobreza_personas';
UPDATE indicator_history SET indicator_code = 'private_sector_loans'         WHERE indicator_code = 'prestamos_sector_privado';
UPDATE indicator_history SET indicator_code = 'industrial_production'        WHERE indicator_code = 'produccion_industrial';
UPDATE indicator_history SET indicator_code = 'tax_revenue'                  WHERE indicator_code = 'recaudacion_tributaria';
UPDATE indicator_history SET indicator_code = 'international_reserves'       WHERE indicator_code = 'reservas_internacionales';
UPDATE indicator_history SET indicator_code = 'financial_balance'            WHERE indicator_code = 'resultado_financiero';
UPDATE indicator_history SET indicator_code = 'primary_balance'              WHERE indicator_code = 'resultado_primario';
UPDATE indicator_history SET indicator_code = 'country_risk'                 WHERE indicator_code = 'riesgo_pais';
UPDATE indicator_history SET indicator_code = 'minimum_wage'                 WHERE indicator_code = 'salario_minimo';
UPDATE indicator_history SET indicator_code = 'energy_subsidies'             WHERE indicator_code = 'subsidios_energia';
UPDATE indicator_history SET indicator_code = 'transport_subsidies'          WHERE indicator_code = 'subsidios_transporte';
UPDATE indicator_history SET indicator_code = 'rate_overdraft'               WHERE indicator_code = 'tasa_adelantos_cuenta_corriente';
UPDATE indicator_history SET indicator_code = 'rate_time_deposit'            WHERE indicator_code = 'tasa_plazo_fijo';
UPDATE indicator_history SET indicator_code = 'rate_personal_loans'          WHERE indicator_code = 'tasa_prestamos_personales';
UPDATE indicator_history SET indicator_code = 'rate_tamar'                   WHERE indicator_code = 'tasa_tamar';
UPDATE indicator_history SET indicator_code = 'taxes_municipal'              WHERE indicator_code = 'tributos_municipales';
UPDATE indicator_history SET indicator_code = 'taxes_national'               WHERE indicator_code = 'tributos_nacionales';
UPDATE indicator_history SET indicator_code = 'taxes_provincial'             WHERE indicator_code = 'tributos_provinciales';
UPDATE indicator_history SET indicator_code = 'taxes_total'                  WHERE indicator_code = 'tributos_total';

-- Catch-all para cotizaciones históricas de dólar/cripto no catalogadas
-- (ej. dolar_solidario): sólo cambia el prefijo, conserva el sufijo de la fuente.
UPDATE indicator_history SET indicator_code = 'dollar_' || substring(indicator_code from 7) WHERE indicator_code LIKE 'dolar\_%';
UPDATE indicator_history SET indicator_code = 'crypto_' || substring(indicator_code from 8) WHERE indicator_code LIKE 'cripto\_%';

COMMIT;
