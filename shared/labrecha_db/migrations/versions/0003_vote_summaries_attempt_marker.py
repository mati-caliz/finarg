"""Permite marcar votaciones ya intentadas y no resumibles.

Revision ID: 0003
Revises: 0002

"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("congress_vote_summaries", "summary", existing_type=sa.Text(), nullable=True)
    op.alter_column(
        "congress_vote_summaries", "topic", existing_type=sa.String(length=40), nullable=True
    )


def downgrade() -> None:
    op.execute("DELETE FROM congress_vote_summaries WHERE summary IS NULL OR topic IS NULL")
    op.alter_column("congress_vote_summaries", "summary", existing_type=sa.Text(), nullable=False)
    op.alter_column(
        "congress_vote_summaries", "topic", existing_type=sa.String(length=40), nullable=False
    )
