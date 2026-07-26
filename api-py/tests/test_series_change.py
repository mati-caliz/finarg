from __future__ import annotations

from datetime import date
from decimal import Decimal

from labrecha_api.schemas import TermMethod
from labrecha_api.series_change import accumulated_change, method_for

DNU_70_2023 = date(2023, 12, 20)


def points(*pairs: tuple[str, str]) -> list[tuple[date, Decimal]]:
    return [(date.fromisoformat(day), Decimal(value)) for day, value in pairs]


def test_a_level_series_compares_the_first_and_the_last_measurement() -> None:
    change = accumulated_change(
        points(("2023-12-20", "1000"), ("2024-06-01", "1200"), ("2026-07-01", "1500")),
        TermMethod.ENDPOINTS,
    )

    assert change == Decimal(50)


def test_a_rate_series_compounds_instead_of_summing() -> None:
    change = accumulated_change(
        points(("2023-12-20", "10"), ("2024-01-20", "10")),
        TermMethod.COMPOUNDED,
    )

    assert change == Decimal(21)


def test_one_measurement_is_no_change_for_a_level_but_is_the_rate_itself() -> None:
    assert accumulated_change(points(("2023-12-20", "1000")), TermMethod.ENDPOINTS) == Decimal(0)
    assert accumulated_change(points(("2023-12-20", "10")), TermMethod.COMPOUNDED) == Decimal(10)


def test_an_empty_window_is_no_change() -> None:
    assert accumulated_change([], TermMethod.ENDPOINTS) == Decimal(0)
    assert accumulated_change([], TermMethod.COMPOUNDED) == Decimal(0)


def test_a_first_value_of_zero_does_not_divide_by_zero() -> None:
    change = accumulated_change(
        points(("2023-12-20", "0"), ("2026-07-01", "1500")), TermMethod.ENDPOINTS
    )

    assert change == Decimal(0)


def test_a_negative_first_value_uses_its_absolute_value_as_the_base() -> None:
    change = accumulated_change(
        points(("2023-12-20", "-100"), ("2026-07-01", "-50")), TermMethod.ENDPOINTS
    )

    assert change == Decimal(50)


def test_the_method_depends_on_the_indicator_not_on_the_window() -> None:
    assert method_for("cpi_monthly") is TermMethod.COMPOUNDED
    assert method_for("dollar_blue") is TermMethod.ENDPOINTS
    assert method_for("international_reserves") is TermMethod.ENDPOINTS
