from __future__ import annotations

from datetime import date
from decimal import Decimal

from labrecha_api.government_terms import TERMS, GovernmentTerm
from labrecha_api.routers.terms import (
    MONTHLY_RATE_INDICATORS,
    _annualize,
    _compound,
    _method_for,
    _most_covered_source,
    _term_stat,
)
from labrecha_api.schemas import TermMethod

TERM = GovernmentTerm("test", "Presidenta de prueba", date(2020, 1, 1), date(2024, 1, 1))


def test_rate_indicators_are_compounded_and_the_rest_compare_endpoints() -> None:
    for code in MONTHLY_RATE_INDICATORS:
        assert _method_for(code) is TermMethod.COMPOUNDED
    assert _method_for("international_reserves") is TermMethod.ENDPOINTS


def test_compounding_two_monthly_rates_is_not_their_sum() -> None:
    assert _compound([Decimal(10), Decimal(10)]) == Decimal(21)


def test_compounding_an_empty_series_yields_no_change() -> None:
    assert _compound([]) == Decimal(0)


def test_compounding_handles_negative_rates() -> None:
    assert _compound([Decimal(10), Decimal(-10)]) == Decimal(-1)


def test_annualizing_needs_a_time_span() -> None:
    assert _annualize(Decimal(50), date(2020, 1, 1), date(2020, 1, 1)) is None


def test_annualizing_a_total_wipeout_is_undefined() -> None:
    assert _annualize(Decimal(-100), date(2020, 1, 1), date(2022, 1, 1)) is None


def test_annualized_change_is_lower_than_the_accumulated_one_over_several_years() -> None:
    annualized = _annualize(Decimal(100), date(2020, 1, 1), date(2024, 1, 1))

    assert annualized is not None
    assert Decimal(0) < annualized < Decimal(100)


def test_a_term_without_points_has_no_stat() -> None:
    assert _term_stat(TERM, [], TermMethod.ENDPOINTS) is None


def test_endpoints_method_compares_the_first_and_last_value() -> None:
    points = [
        (date(2020, 1, 1), Decimal(100)),
        (date(2022, 1, 1), Decimal(300)),
        (date(2023, 1, 1), Decimal(150)),
    ]

    stat = _term_stat(TERM, points, TermMethod.ENDPOINTS)

    assert stat is not None
    assert stat.first_value == Decimal(100)
    assert stat.last_value == Decimal(150)
    assert stat.change_pct == Decimal(50)
    assert stat.points == 3
    assert stat.average == Decimal(550) / Decimal(3)


def test_endpoints_method_survives_a_first_value_of_zero() -> None:
    points = [(date(2020, 1, 1), Decimal(0)), (date(2023, 1, 1), Decimal(120))]

    stat = _term_stat(TERM, points, TermMethod.ENDPOINTS)

    assert stat is not None
    assert stat.change_pct == Decimal(0)


def test_endpoints_method_handles_a_negative_first_value() -> None:
    points = [(date(2020, 1, 1), Decimal(-100)), (date(2023, 1, 1), Decimal(-50))]

    stat = _term_stat(TERM, points, TermMethod.ENDPOINTS)

    assert stat is not None
    assert stat.change_pct == Decimal(50)


def test_compounded_method_accumulates_the_monthly_rates() -> None:
    points = [
        (date(2020, 1, 1), Decimal(10)),
        (date(2020, 2, 1), Decimal(10)),
        (date(2020, 3, 1), Decimal(10)),
    ]

    stat = _term_stat(TERM, points, TermMethod.COMPOUNDED)

    assert stat is not None
    assert stat.change_pct == Decimal("33.1")


def test_the_stat_carries_the_term_identity_and_its_covered_range() -> None:
    points = [(date(2021, 5, 1), Decimal(1)), (date(2022, 5, 1), Decimal(2))]

    stat = _term_stat(TERM, points, TermMethod.ENDPOINTS)

    assert stat is not None
    assert stat.term_id == TERM.term_id
    assert stat.president == TERM.president
    assert stat.start == TERM.start
    assert stat.end == TERM.end
    assert stat.first_date == date(2021, 5, 1)
    assert stat.last_date == date(2022, 5, 1)


def test_the_resolved_source_is_the_one_with_most_points() -> None:
    rows = [
        (date(2020, 1, 1), Decimal(1), "bcra"),
        (date(2020, 2, 1), Decimal(2), "datosgobar"),
        (date(2020, 3, 1), Decimal(3), "datosgobar"),
    ]

    assert _most_covered_source(rows) == "datosgobar"


def test_terms_are_chronological_and_only_the_current_one_is_open() -> None:
    for term in TERMS:
        if term.end is not None:
            assert term.start < term.end

    starts = [term.start for term in TERMS]
    assert starts == sorted(starts)
    assert TERMS[-1].end is None
    assert all(term.end is not None for term in TERMS[:-1])


def test_term_ids_are_unique() -> None:
    identifiers = [term.term_id for term in TERMS]

    assert len(identifiers) == len(set(identifiers))
