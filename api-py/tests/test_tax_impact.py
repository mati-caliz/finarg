from __future__ import annotations

from datetime import date, timedelta
from decimal import ROUND_HALF_UP, Decimal

from labrecha_api.clock import today_in_argentina
from labrecha_api.income_tax import MONTHS_PER_YEAR, SALARY_PAYMENTS_PER_YEAR
from labrecha_api.schemas import TaxImpactRequest
from labrecha_api.tax_impact import (
    CATEGORY_SOCIAL_SECURITY,
    CATEGORY_TAX,
    DAYS_IN_YEAR,
    VAT_BASE,
    VAT_RATE,
    calculate_tax_impact,
)

SALARY = Decimal(3000000)
EXPENSES = Decimal(1210000)
MONEY = Decimal("0.01")


def _request(**overrides: object) -> TaxImpactRequest:
    payload: dict[str, object] = {
        "gross_monthly_salary": SALARY,
        "monthly_expenses": EXPENSES,
    }
    payload.update(overrides)
    return TaxImpactRequest.model_validate(payload)


def test_annual_totals_use_the_thirteenth_payment_for_income_but_not_for_expenses() -> None:
    result = calculate_tax_impact(_request())

    assert result.gross_annual_income == SALARY * SALARY_PAYMENTS_PER_YEAR
    assert result.annual_expenses == EXPENSES * MONTHS_PER_YEAR


def test_vat_is_extracted_from_expenses_that_already_include_it() -> None:
    result = calculate_tax_impact(_request())

    vat = next(item for item in result.items if item.concept == "IVA en tus gastos")
    expected = (EXPENSES * MONTHS_PER_YEAR * VAT_RATE / VAT_BASE).quantize(
        MONEY, rounding=ROUND_HALF_UP
    )
    assert vat.annual_amount == expected
    assert vat.category == CATEGORY_TAX


def test_gross_receipts_are_charged_over_the_amount_net_of_vat() -> None:
    rate = Decimal(5)
    result = calculate_tax_impact(_request(iibb_rate=rate))

    item = next(item for item in result.items if item.concept == "Ingresos Brutos en tus gastos")
    net_of_vat = EXPENSES * MONTHS_PER_YEAR * Decimal(100) / VAT_BASE
    expected = (net_of_vat * rate / Decimal(100)).quantize(MONEY, rounding=ROUND_HALF_UP)
    assert item.annual_amount == expected


def test_a_zero_gross_receipts_rate_removes_that_item_amount() -> None:
    result = calculate_tax_impact(_request(iibb_rate=Decimal(0)))

    item = next(item for item in result.items if item.concept == "Ingresos Brutos en tus gastos")
    assert item.annual_amount == Decimal(0)


def test_retired_taxpayer_has_no_social_security_contributions() -> None:
    result = calculate_tax_impact(_request(retired=True))

    contributions = next(item for item in result.items if item.category == CATEGORY_SOCIAL_SECURITY)
    assert contributions.annual_amount == Decimal(0)


def test_monthly_amount_is_the_annual_one_split_in_twelve() -> None:
    result = calculate_tax_impact(_request())

    for item in result.items:
        assert item.monthly_amount == (item.annual_amount / MONTHS_PER_YEAR).quantize(
            MONEY, rounding=ROUND_HALF_UP
        )


def test_total_is_the_sum_of_every_item() -> None:
    result = calculate_tax_impact(_request())

    assert result.total_annual == sum(item.annual_amount for item in result.items)


def test_share_of_income_is_a_percentage_of_the_gross_annual_income() -> None:
    result = calculate_tax_impact(_request())

    for item in result.items:
        expected = (item.annual_amount / result.gross_annual_income * Decimal(100)).quantize(
            MONEY, rounding=ROUND_HALF_UP
        )
        assert item.share_of_income == expected


def test_days_for_the_state_never_exceed_the_year() -> None:
    result = calculate_tax_impact(_request(monthly_expenses=SALARY * 10))

    assert result.days_for_the_state <= int(DAYS_IN_YEAR)


def test_tax_freedom_date_is_counted_from_january_first_of_the_current_year() -> None:
    result = calculate_tax_impact(_request())

    start_of_year = date(today_in_argentina().year, 1, 1)
    assert result.tax_freedom_date == start_of_year + timedelta(days=result.days_for_the_state)


def test_more_expenses_mean_more_tax_pressure() -> None:
    light = calculate_tax_impact(_request(monthly_expenses=EXPENSES))
    heavy = calculate_tax_impact(_request(monthly_expenses=EXPENSES * 2))

    assert heavy.total_pressure > light.total_pressure
    assert heavy.days_for_the_state > light.days_for_the_state


def test_no_expenses_leave_only_income_tax_and_contributions() -> None:
    result = calculate_tax_impact(_request(monthly_expenses=Decimal(0)))

    consumption_taxes = [
        item.annual_amount
        for item in result.items
        if item.concept in {"IVA en tus gastos", "Ingresos Brutos en tus gastos"}
    ]
    assert consumption_taxes == [Decimal(0), Decimal(0)]
