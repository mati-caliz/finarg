-- Increase precision for property_prices columns to support large ARS values

ALTER TABLE property_prices
    ALTER COLUMN price_total TYPE NUMERIC(18, 2);

ALTER TABLE property_prices
    ALTER COLUMN price_per_m2 TYPE NUMERIC(15, 2);

ALTER TABLE property_prices
    ALTER COLUMN expenses TYPE NUMERIC(12, 2);
