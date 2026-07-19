from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from labrecha_api.db import get_session
from labrecha_api.models import CongressVote, CongressVoteDetail
from labrecha_api.schemas import CongressVoteDetailOut, CongressVoteOut

router = APIRouter(prefix="/congress", tags=["congress"])


def _to_vote_out(vote: CongressVote) -> CongressVoteOut:
    return CongressVoteOut(
        acta_id=vote.acta_id,
        period_number=vote.period_number,
        session_type=vote.session_type,
        date=vote.date,
        title=vote.title,
        result=vote.result,
        president_name=vote.president_name,
        affirmative_votes=vote.affirmative_votes,
        negative_votes=vote.negative_votes,
        abstentions=vote.abstentions,
        absents=vote.absents,
    )


@router.get("/votes", response_model=list[CongressVoteOut])
def list_votes(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    result: str | None = Query(default=None),
    period_number: int | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
) -> list[CongressVoteOut]:
    conditions = []
    if date_from is not None:
        conditions.append(CongressVote.date >= date_from)
    if date_to is not None:
        conditions.append(CongressVote.date <= date_to)
    if result is not None:
        conditions.append(CongressVote.result == result)
    if period_number is not None:
        conditions.append(CongressVote.period_number == period_number)

    statement = (
        select(CongressVote)
        .where(*conditions)
        .order_by(CongressVote.date.desc().nullslast(), CongressVote.acta_id.desc())
        .limit(limit)
        .offset(offset)
    )
    return [_to_vote_out(vote) for vote in session.scalars(statement).all()]


@router.get("/votes/{acta_id}", response_model=CongressVoteOut)
def get_vote(acta_id: str, session: Session = Depends(get_session)) -> CongressVoteOut:
    vote = session.get(CongressVote, acta_id)
    if vote is None:
        raise HTTPException(status_code=404, detail=f"acta desconocida: {acta_id}")
    return _to_vote_out(vote)


@router.get("/votes/{acta_id}/details", response_model=list[CongressVoteDetailOut])
def list_vote_details(
    acta_id: str,
    vote: str | None = Query(default=None),
    bloc: str | None = Query(default=None),
    session: Session = Depends(get_session),
) -> list[CongressVoteDetailOut]:
    if session.get(CongressVote, acta_id) is None:
        raise HTTPException(status_code=404, detail=f"acta desconocida: {acta_id}")

    conditions = [CongressVoteDetail.acta_id == acta_id]
    if vote is not None:
        conditions.append(CongressVoteDetail.vote == vote)
    if bloc is not None:
        conditions.append(CongressVoteDetail.bloc == bloc)

    statement = (
        select(CongressVoteDetail)
        .where(*conditions)
        .order_by(CongressVoteDetail.bloc, CongressVoteDetail.deputy_name)
    )
    return [
        CongressVoteDetailOut(
            acta_id=detail.acta_id,
            deputy_name=detail.deputy_name,
            bloc=detail.bloc,
            district=detail.district,
            vote=detail.vote,
        )
        for detail in session.scalars(statement).all()
    ]
