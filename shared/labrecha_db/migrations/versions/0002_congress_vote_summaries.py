"""Resumenes generados de cada votacion nominal.

Revision ID: 0002
Revises: 0001

"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "congress_vote_summaries",
        sa.Column("vote_record_id", sa.String(length=20), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("topic", sa.String(length=40), nullable=False),
        sa.Column("file_numbers", sa.Text(), nullable=True),
        sa.Column(
            "generated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("vote_record_id"),
    )


def downgrade() -> None:
    op.drop_table("congress_vote_summaries")
