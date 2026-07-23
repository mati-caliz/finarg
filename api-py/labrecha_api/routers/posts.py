from __future__ import annotations

import secrets
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from labrecha_api.config import settings
from labrecha_api.db import get_session
from labrecha_api.models import Post
from labrecha_api.schemas import PostCategory, PostCreate, PostImpact, PostOut, PostUpdate

router = APIRouter(prefix="/posts", tags=["posts"])


def require_admin(x_admin_token: str = Header(default="")) -> None:
    if not settings.admin_token or not secrets.compare_digest(x_admin_token, settings.admin_token):
        raise HTTPException(status_code=401, detail="No autorizado")


def to_post_out(post: Post) -> PostOut:
    return PostOut(
        id=post.id,
        slug=post.slug,
        title=post.title,
        category=PostCategory(post.category),
        summary=post.summary,
        content=post.content,
        impacts=[PostImpact.model_validate(impact) for impact in post.impacts]
        if post.impacts is not None
        else None,
        published=post.published,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


@router.get("", response_model=list[PostOut])
def list_published_posts(
    category: PostCategory | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
) -> list[PostOut]:
    conditions = [Post.published.is_(True)]
    if category is not None:
        conditions.append(Post.category == category.value)
    statement = (
        select(Post).where(*conditions).order_by(Post.created_at.desc()).limit(limit).offset(offset)
    )
    return [to_post_out(post) for post in session.scalars(statement).all()]


@router.get("/all", response_model=list[PostOut], dependencies=[Depends(require_admin)])
def list_all_posts(session: Session = Depends(get_session)) -> list[PostOut]:
    statement = select(Post).order_by(Post.created_at.desc())
    return [to_post_out(post) for post in session.scalars(statement).all()]


@router.get("/{slug}", response_model=PostOut)
def get_published_post(slug: str, session: Session = Depends(get_session)) -> PostOut:
    post = session.scalars(
        select(Post).where(Post.slug == slug, Post.published.is_(True))
    ).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post no encontrado")
    return to_post_out(post)


@router.post("", response_model=PostOut, status_code=201, dependencies=[Depends(require_admin)])
def create_post(payload: PostCreate, session: Session = Depends(get_session)) -> PostOut:
    existing = session.scalars(select(Post).where(Post.slug == payload.slug)).first()
    if existing is not None:
        raise HTTPException(status_code=409, detail="Ya existe un post con ese slug")
    now = datetime.now(UTC)
    post = Post(
        slug=payload.slug,
        title=payload.title,
        category=payload.category.value,
        summary=payload.summary,
        content=payload.content,
        impacts=[impact.model_dump(mode="json") for impact in payload.impacts]
        if payload.impacts is not None
        else None,
        published=payload.published,
        created_at=now,
        updated_at=now,
    )
    session.add(post)
    session.commit()
    session.refresh(post)
    return to_post_out(post)


@router.put("/{post_id}", response_model=PostOut, dependencies=[Depends(require_admin)])
def update_post(
    post_id: int, payload: PostUpdate, session: Session = Depends(get_session)
) -> PostOut:
    post = session.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post no encontrado")
    changes = payload.model_dump(exclude_unset=True, mode="json")
    if "slug" in changes and changes["slug"] != post.slug:
        duplicate = session.scalars(select(Post).where(Post.slug == changes["slug"])).first()
        if duplicate is not None:
            raise HTTPException(status_code=409, detail="Ya existe un post con ese slug")
    for field, value in changes.items():
        if field == "category":
            post.category = PostCategory(value).value
        else:
            setattr(post, field, value)
    post.updated_at = datetime.now(UTC)
    session.commit()
    session.refresh(post)
    return to_post_out(post)


@router.delete("/{post_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_post(post_id: int, session: Session = Depends(get_session)) -> None:
    post = session.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post no encontrado")
    session.delete(post)
    session.commit()
