from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from labrecha_db import NewsArticle
from sqlalchemy import select
from sqlalchemy.orm import Session

from labrecha_api.db import get_session
from labrecha_api.schemas import NewsArticleOut

router = APIRouter(prefix="/news", tags=["news"])


@router.get("", response_model=list[NewsArticleOut])
def list_news(
    source: str | None = Query(default=None),
    category: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
) -> list[NewsArticleOut]:
    conditions = []
    if source is not None:
        conditions.append(NewsArticle.source == source)
    if category is not None:
        conditions.append(NewsArticle.category == category)

    statement = (
        select(NewsArticle)
        .where(*conditions)
        .order_by(NewsArticle.published_date.desc())
        .limit(limit)
        .offset(offset)
    )
    return [
        NewsArticleOut(
            title=article.title,
            summary=article.summary,
            source=article.source,
            source_url=article.source_url,
            category=article.category,
            published_date=article.published_date,
            image_url=article.image_url,
        )
        for article in session.scalars(statement).all()
    ]
