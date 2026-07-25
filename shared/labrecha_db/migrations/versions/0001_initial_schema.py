"""Esquema inicial: tablas creadas historicamente con create_all.

Revision ID: 0001
Revises: -

"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "congress_vote_details",
        sa.Column("vote_detail_id", sa.String(length=20), nullable=False),
        sa.Column("vote_record_id", sa.String(length=20), nullable=False),
        sa.Column("deputy_name", sa.String(length=200), nullable=True),
        sa.Column("bloc", sa.String(length=200), nullable=True),
        sa.Column("district", sa.String(length=120), nullable=True),
        sa.Column("vote", sa.String(length=20), nullable=True),
        sa.PrimaryKeyConstraint("vote_detail_id"),
    )
    op.create_index(
        "ix_congress_vote_details_bloc", "congress_vote_details", ["bloc"], unique=False
    )
    op.create_index(
        "ix_congress_vote_details_vote_record",
        "congress_vote_details",
        ["vote_record_id"],
        unique=False,
    )
    op.create_table(
        "congress_votes",
        sa.Column("vote_record_id", sa.String(length=20), nullable=False),
        sa.Column("session_source_id", sa.String(length=40), nullable=True),
        sa.Column("period_number", sa.Integer(), nullable=True),
        sa.Column("period_type", sa.String(length=40), nullable=True),
        sa.Column("session_type", sa.String(length=60), nullable=True),
        sa.Column("meeting_number", sa.String(length=20), nullable=True),
        sa.Column("session_number", sa.String(length=20), nullable=True),
        sa.Column("ballot_number", sa.String(length=20), nullable=True),
        sa.Column("date", sa.Date(), nullable=True),
        sa.Column("time", sa.String(length=10), nullable=True),
        sa.Column("majority_base", sa.String(length=60), nullable=True),
        sa.Column("majority_type", sa.String(length=60), nullable=True),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column("result", sa.String(length=40), nullable=True),
        sa.Column("president_name", sa.String(length=160), nullable=True),
        sa.Column("affirmative_votes", sa.Integer(), nullable=True),
        sa.Column("negative_votes", sa.Integer(), nullable=True),
        sa.Column("abstentions", sa.Integer(), nullable=True),
        sa.Column("absents", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("vote_record_id"),
    )
    op.create_index("ix_congress_votes_date", "congress_votes", ["date"], unique=False)
    op.create_table(
        "gazette_summaries",
        sa.Column("regulation_id", sa.String(length=40), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("section", sa.String(length=40), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=40), nullable=False),
        sa.Column("url", sa.String(length=300), nullable=False),
        sa.PrimaryKeyConstraint("regulation_id"),
    )
    op.create_index("ix_gazette_summaries_date", "gazette_summaries", ["date"], unique=False)
    op.create_table(
        "holidays",
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("local_name", sa.String(length=160), nullable=True),
        sa.Column("is_global", sa.Boolean(), nullable=True),
        sa.Column("is_fixed", sa.Boolean(), nullable=True),
        sa.Column("types", sa.String(length=120), nullable=True),
        sa.PrimaryKeyConstraint("date", "name"),
    )
    op.create_table(
        "indicator_history",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("indicator_code", sa.String(length=80), nullable=False),
        sa.Column("source", sa.String(length=40), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("value", sa.Numeric(precision=24, scale=6), nullable=False),
        sa.Column("meta", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("indicator_code", "source", "date", name="uq_indicator_source_date"),
    )
    op.create_index(
        "ix_indicator_code_date", "indicator_history", ["indicator_code", "date"], unique=False
    )
    op.create_table(
        "news_articles",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("summary", sa.String(length=1000), nullable=False),
        sa.Column("source", sa.String(length=255), nullable=False),
        sa.Column("source_url", sa.String(length=2048), nullable=False),
        sa.Column("country", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=255), nullable=False),
        sa.Column("published_date", sa.DateTime(), nullable=False),
        sa.Column("image_url", sa.String(length=1000), nullable=True),
        sa.Column("is_official", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("source_url"),
    )
    op.create_table(
        "political_events",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("category", sa.String(length=60), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("date", "title", name="uq_event_date_title"),
    )
    op.create_index("ix_political_events_date", "political_events", ["date"], unique=False)
    op.create_table(
        "posts",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("slug", sa.String(length=160), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("category", sa.String(length=40), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("impacts", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("published", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(
        "ix_posts_published_created", "posts", ["published", "created_at"], unique=False
    )
    op.create_table(
        "rent_by_neighborhood",
        sa.Column("neighborhood", sa.String(length=80), nullable=False),
        sa.Column("commune", sa.String(length=20), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("price", sa.Numeric(precision=16, scale=2), nullable=False),
        sa.Column("rooms", sa.String(length=20), nullable=True),
        sa.PrimaryKeyConstraint("neighborhood"),
    )
    op.create_table(
        "revenue_sharing_shares",
        sa.Column("province", sa.String(length=60), nullable=False),
        sa.Column("coefficient", sa.Numeric(precision=12, scale=8), nullable=False),
        sa.Column("source", sa.String(length=40), nullable=False),
        sa.PrimaryKeyConstraint("province"),
    )
    op.create_table(
        "sanctioned_laws",
        sa.Column("law_number", sa.String(length=20), nullable=False),
        sa.Column("project_id", sa.String(length=40), nullable=True),
        sa.Column("sanctioning_chamber", sa.String(length=40), nullable=True),
        sa.Column("initial_file", sa.String(length=40), nullable=True),
        sa.Column("first_half_sanction", sa.Date(), nullable=True),
        sa.Column("second_half_sanction", sa.Date(), nullable=True),
        sa.Column("final_sanction", sa.Date(), nullable=True),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("law_number"),
    )
    op.create_index("ix_sanctioned_laws_final", "sanctioned_laws", ["final_sanction"], unique=False)
    op.create_table(
        "scrape_runs",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("job_name", sa.String(length=60), nullable=False),
        sa.Column(
            "started_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("rows_upserted", sa.BigInteger(), nullable=False),
        sa.Column("error", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_scrape_runs_job_started", "scrape_runs", ["job_name", "started_at"], unique=False
    )
    op.create_table(
        "senators",
        sa.Column("senator_id", sa.String(length=20), nullable=False),
        sa.Column("last_name", sa.String(length=120), nullable=True),
        sa.Column("first_name", sa.String(length=120), nullable=True),
        sa.Column("bloc", sa.String(length=160), nullable=True),
        sa.Column("province", sa.String(length=80), nullable=True),
        sa.Column("party", sa.String(length=160), nullable=True),
        sa.Column("mandate_start", sa.Date(), nullable=True),
        sa.Column("mandate_end", sa.Date(), nullable=True),
        sa.Column("email", sa.String(length=160), nullable=True),
        sa.Column("photo_url", sa.String(length=300), nullable=True),
        sa.PrimaryKeyConstraint("senator_id"),
    )
    op.create_index("ix_senators_bloc", "senators", ["bloc"], unique=False)
    op.create_index("ix_senators_province", "senators", ["province"], unique=False)
    op.create_table(
        "tax_changes",
        sa.Column("regulation_id", sa.String(length=40), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("change_type", sa.String(length=20), nullable=False),
        sa.Column("tax_name", sa.Text(), nullable=False),
        sa.Column("jurisdiction", sa.String(length=20), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("url", sa.String(length=300), nullable=False),
        sa.PrimaryKeyConstraint("regulation_id"),
    )
    op.create_index("ix_tax_changes_date", "tax_changes", ["date"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_tax_changes_date", table_name="tax_changes")
    op.drop_table("tax_changes")
    op.drop_index("ix_senators_province", table_name="senators")
    op.drop_index("ix_senators_bloc", table_name="senators")
    op.drop_table("senators")
    op.drop_index("ix_scrape_runs_job_started", table_name="scrape_runs")
    op.drop_table("scrape_runs")
    op.drop_index("ix_sanctioned_laws_final", table_name="sanctioned_laws")
    op.drop_table("sanctioned_laws")
    op.drop_table("revenue_sharing_shares")
    op.drop_table("rent_by_neighborhood")
    op.drop_index("ix_posts_published_created", table_name="posts")
    op.drop_table("posts")
    op.drop_index("ix_political_events_date", table_name="political_events")
    op.drop_table("political_events")
    op.drop_table("news_articles")
    op.drop_index("ix_indicator_code_date", table_name="indicator_history")
    op.drop_table("indicator_history")
    op.drop_table("holidays")
    op.drop_index("ix_gazette_summaries_date", table_name="gazette_summaries")
    op.drop_table("gazette_summaries")
    op.drop_index("ix_congress_votes_date", table_name="congress_votes")
    op.drop_table("congress_votes")
    op.drop_index("ix_congress_vote_details_vote_record", table_name="congress_vote_details")
    op.drop_index("ix_congress_vote_details_bloc", table_name="congress_vote_details")
    op.drop_table("congress_vote_details")
