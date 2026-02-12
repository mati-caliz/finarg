-- Increase precision for properties surface columns

ALTER TABLE properties
    ALTER COLUMN surface_m2 TYPE NUMERIC(12, 2);

ALTER TABLE properties
    ALTER COLUMN covered_surface_m2 TYPE NUMERIC(12, 2);
