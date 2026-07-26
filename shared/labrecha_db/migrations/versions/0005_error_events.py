"""Guarda los errores de producción agrupados por fingerprint.

Revision ID: 0005
Revises: 0004

"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None

TABLE = "error_events"


def upgrade() -> None:
    op.create_table(
        TABLE,
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("fingerprint", sa.String(length=64), nullable=False),
        sa.Column("origin", sa.String(length=20), nullable=False),
        sa.Column("kind", sa.String(length=160), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("stack", sa.Text(), nullable=True),
        sa.Column("path", sa.String(length=300), nullable=True),
        sa.Column("occurrences", sa.BigInteger(), nullable=False),
        sa.Column(
            "first_seen_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "last_seen_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("fingerprint"),
    )
    op.create_index("ix_error_events_last_seen", TABLE, ["last_seen_at"])


def downgrade() -> None:
    op.drop_index("ix_error_events_last_seen", table_name=TABLE)
    op.drop_table(TABLE)
