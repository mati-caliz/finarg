"""Permite guardar historia de alquileres por barrio, no una sola foto.

La PK era sólo `neighborhood`, así que cada corrida sobreescribía el mes anterior
aunque la tabla tuviera columna `date`. Pasa a `(neighborhood, date)`.

El nombre de la PK existente se descubre del catálogo en vez de asumirse: la base
de producción fue adoptada de un `create_all` viejo y puede no tener PK, o tenerla
con otro nombre.

Revision ID: 0004
Revises: 0003

"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None

TABLE = "rent_by_neighborhood"
PRIMARY_KEY = "rent_by_neighborhood_pkey"

FIND_PRIMARY_KEY = sa.text(
    "SELECT conname FROM pg_constraint "
    "WHERE conrelid = to_regclass('rent_by_neighborhood') AND contype = 'p'"
)
DROP_NULL_DATES = sa.text("DELETE FROM rent_by_neighborhood WHERE date IS NULL")
DROP_DUPLICATES = sa.text(
    """
    DELETE FROM rent_by_neighborhood AS duplicated
    USING rent_by_neighborhood AS kept
    WHERE duplicated.ctid < kept.ctid
      AND duplicated.neighborhood = kept.neighborhood
      AND duplicated.date = kept.date
    """
)
DROP_OUTDATED_MONTHS = sa.text(
    """
    DELETE FROM rent_by_neighborhood AS outdated
    USING (
        SELECT neighborhood, max(date) AS latest
        FROM rent_by_neighborhood
        GROUP BY neighborhood
    ) AS newest
    WHERE outdated.neighborhood = newest.neighborhood AND outdated.date < newest.latest
    """
)


def _drop_existing_primary_key() -> None:
    existing = op.get_bind().execute(FIND_PRIMARY_KEY).scalar()
    if existing is not None:
        op.drop_constraint(existing, TABLE, type_="primary")


def upgrade() -> None:
    _drop_existing_primary_key()
    connection = op.get_bind()
    connection.execute(DROP_NULL_DATES)
    connection.execute(DROP_DUPLICATES)
    op.alter_column(TABLE, "date", existing_type=sa.Date(), nullable=False)
    op.create_primary_key(PRIMARY_KEY, TABLE, ["neighborhood", "date"])


def downgrade() -> None:
    op.get_bind().execute(DROP_OUTDATED_MONTHS)
    _drop_existing_primary_key()
    op.create_primary_key(PRIMARY_KEY, TABLE, ["neighborhood"])
