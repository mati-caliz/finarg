"""Permite guardar historia de alquileres por barrio, no una sola foto.

La PK era sólo `neighborhood`, así que cada corrida sobreescribía el mes anterior
aunque la tabla tuviera columna `date`. Pasa a `(neighborhood, date)`.

Revision ID: 0004
Revises: 0003

"""

from __future__ import annotations

from alembic import op

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None

TABLE = "rent_by_neighborhood"
PRIMARY_KEY = "rent_by_neighborhood_pkey"


def upgrade() -> None:
    op.drop_constraint(PRIMARY_KEY, TABLE, type_="primary")
    op.create_primary_key(PRIMARY_KEY, TABLE, ["neighborhood", "date"])


def downgrade() -> None:
    op.execute(
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
    op.drop_constraint(PRIMARY_KEY, TABLE, type_="primary")
    op.create_primary_key(PRIMARY_KEY, TABLE, ["neighborhood"])
