"""Índices que faltaban y fechas de news_articles con timezone.

El ranking de /gaps filtra por fecha sobre toda indicator_history y el listado de
noticias ordena por published_date: ninguno de los dos tenía índice. Las tres fechas
de news_articles se guardan siempre en UTC (el conector normaliza y saca el tzinfo),
así que pasarlas a timestamptz es una conversión sin pérdida.

Revision ID: 0006
Revises: 0005

"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None

NEWS_TABLE = "news_articles"
NEWS_DATE_COLUMNS = ("published_date", "created_at", "updated_at")

INDICATOR_DATE_INDEX = "ix_indicator_history_date"
NEWS_PUBLISHED_INDEX = "ix_news_articles_published"


def upgrade() -> None:
    op.create_index(INDICATOR_DATE_INDEX, "indicator_history", ["date"])
    op.create_index(NEWS_PUBLISHED_INDEX, NEWS_TABLE, ["published_date"])
    for column in NEWS_DATE_COLUMNS:
        op.alter_column(
            NEWS_TABLE,
            column,
            existing_type=sa.DateTime(),
            type_=sa.DateTime(timezone=True),
            postgresql_using=f"{column} AT TIME ZONE 'UTC'",
        )


def downgrade() -> None:
    for column in NEWS_DATE_COLUMNS:
        op.alter_column(
            NEWS_TABLE,
            column,
            existing_type=sa.DateTime(timezone=True),
            type_=sa.DateTime(),
            postgresql_using=f"{column} AT TIME ZONE 'UTC'",
        )
    op.drop_index(NEWS_PUBLISHED_INDEX, table_name=NEWS_TABLE)
    op.drop_index(INDICATOR_DATE_INDEX, table_name="indicator_history")
