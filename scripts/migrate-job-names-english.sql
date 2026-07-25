-- Renombra los job_name históricos de scrape_runs tras pasar los IDs de job a inglés.
-- Correr una vez contra la base de producción (y local) después de deployar el scraper.
-- Sólo toca scrape_runs.job_name (tracking); no altera indicator_history ni source.
--   docker compose -f docker-compose.prod.yml exec -T postgres \
--     sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < scripts/migrate-job-names-english.sql

BEGIN;

UPDATE scrape_runs SET job_name = 'rent_caba'         WHERE job_name = 'alquiler_caba';
UPDATE scrape_runs SET job_name = 'bcra_rates'        WHERE job_name = 'bcra_tasas';
UPDATE scrape_runs SET job_name = 'official_gazette'  WHERE job_name = 'boletin_oficial';
UPDATE scrape_runs SET job_name = 'congress'          WHERE job_name = 'congreso';
UPDATE scrape_runs SET job_name = 'credit_bcra'       WHERE job_name = 'credito_bcra';
UPDATE scrape_runs SET job_name = 'crypto_historical' WHERE job_name = 'crypto_historico';
UPDATE scrape_runs SET job_name = 'dollar'            WHERE job_name = 'dolar';
UPDATE scrape_runs SET job_name = 'dollar_historical' WHERE job_name = 'dolar_historico';
UPDATE scrape_runs SET job_name = 'inflation'         WHERE job_name = 'inflacion';
UPDATE scrape_runs SET job_name = 'laws'              WHERE job_name = 'leyes';
UPDATE scrape_runs SET job_name = 'reserves_bcra'     WHERE job_name = 'reservas_bcra';
UPDATE scrape_runs SET job_name = 'country_risk'      WHERE job_name = 'riesgo_pais';
UPDATE scrape_runs SET job_name = 'senate'            WHERE job_name = 'senado';

COMMIT;
