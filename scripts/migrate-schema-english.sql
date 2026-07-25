-- Renombra tablas, columnas e índices español del esquema a inglés.
-- Correr UNA vez contra prod (y local) en el mismo deploy que el nuevo código de scraper/api.
-- Preserva los datos (RENAME, no recrea). Idempotencia: correr una sola vez.
--   docker compose -f docker-compose.prod.yml exec -T postgres \
--     sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < scripts/migrate-schema-english.sql

BEGIN;

-- Tablas
ALTER TABLE rent_by_barrio        RENAME TO rent_by_neighborhood;
ALTER TABLE coparticipacion_shares RENAME TO revenue_sharing_shares;
ALTER TABLE boletin_summaries     RENAME TO gazette_summaries;

-- Columnas
ALTER TABLE congress_votes        RENAME COLUMN acta_id TO vote_record_id;
ALTER TABLE congress_vote_details RENAME COLUMN acta_id TO vote_record_id;
ALTER TABLE rent_by_neighborhood  RENAME COLUMN barrio  TO neighborhood;
ALTER TABLE rent_by_neighborhood  RENAME COLUMN comuna  TO commune;
ALTER TABLE gazette_summaries     RENAME COLUMN norma_id TO regulation_id;
ALTER TABLE tax_changes           RENAME COLUMN norma_id TO regulation_id;

-- Índices
ALTER INDEX ix_congress_vote_details_acta RENAME TO ix_congress_vote_details_vote_record;
ALTER INDEX ix_boletin_summaries_date     RENAME TO ix_gazette_summaries_date;

COMMIT;
