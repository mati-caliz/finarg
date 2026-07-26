from __future__ import annotations

from decimal import Decimal
from itertools import pairwise

from labrecha_api.income_tax import (
    CURRENT_SCALE,
    HEALTH_INSURANCE_RATE,
    MONTHS_PER_YEAR,
    RETIREMENT_RATE,
    SALARY_PAYMENTS_PER_YEAR,
    _tax_by_brackets,
    calculate_income_tax,
)
from labrecha_api.schemas import IncomeTaxRequest

LOW_SALARY = Decimal(800000)
HIGH_SALARY = Decimal(9000000)


def test_gross_annual_includes_the_thirteenth_payment() -> None:
    result = calculate_income_tax(IncomeTaxRequest(gross_monthly_salary=LOW_SALARY))

    assert result.gross_annual_salary == LOW_SALARY * SALARY_PAYMENTS_PER_YEAR


def test_salary_below_the_exemption_pays_no_tax() -> None:
    result = calculate_income_tax(IncomeTaxRequest(gross_monthly_salary=LOW_SALARY))

    assert result.annual_tax == Decimal(0)
    assert result.monthly_tax == Decimal(0)
    assert result.taxable_income == Decimal(0)
    assert result.effective_rate == Decimal(0)
    assert result.tax_brackets == []


def test_net_salary_discounts_legal_deductions_and_tax() -> None:
    result = calculate_income_tax(IncomeTaxRequest(gross_monthly_salary=HIGH_SALARY))

    assert result.annual_tax > Decimal(0)
    assert result.net_monthly_salary == (
        HIGH_SALARY - result.monthly_legal_deductions - result.monthly_tax
    )


def test_legal_deductions_are_retirement_health_insurance_and_law_19032() -> None:
    result = calculate_income_tax(IncomeTaxRequest(gross_monthly_salary=HIGH_SALARY))

    breakdown = result.deduction_breakdown
    assert breakdown.retirement == (
        HIGH_SALARY * SALARY_PAYMENTS_PER_YEAR * RETIREMENT_RATE / MONTHS_PER_YEAR
    ).quantize(Decimal("0.01"))
    assert breakdown.health_insurance == breakdown.law_19032
    assert breakdown.union_dues == Decimal(0)


def test_retired_taxpayer_pays_no_retirement_or_health_insurance() -> None:
    result = calculate_income_tax(IncomeTaxRequest(gross_monthly_salary=HIGH_SALARY, retired=True))

    breakdown = result.deduction_breakdown
    assert breakdown.retirement == Decimal(0)
    assert breakdown.health_insurance == Decimal(0)
    assert breakdown.law_19032 == Decimal(0)
    assert result.monthly_legal_deductions == Decimal(0)


def test_union_dues_percent_takes_precedence_over_the_fixed_amount() -> None:
    by_percent = calculate_income_tax(
        IncomeTaxRequest(
            gross_monthly_salary=HIGH_SALARY,
            union_dues_percent=Decimal(3),
            union_dues=Decimal(1),
        )
    )

    expected_annual = HIGH_SALARY * SALARY_PAYMENTS_PER_YEAR * HEALTH_INSURANCE_RATE
    assert by_percent.deduction_breakdown.union_dues == (
        expected_annual / MONTHS_PER_YEAR
    ).quantize(Decimal("0.01"))


def test_family_allowances_add_spouse_and_children() -> None:
    result = calculate_income_tax(
        IncomeTaxRequest(
            gross_monthly_salary=HIGH_SALARY,
            has_spouse=True,
            number_of_children=2,
        )
    )

    assert result.calculation_details.family_allowances == (
        CURRENT_SCALE.spouse_allowance + CURRENT_SCALE.child_allowance * 2
    )


def test_children_with_disabilities_are_capped_by_the_total_number_of_children() -> None:
    result = calculate_income_tax(
        IncomeTaxRequest(
            gross_monthly_salary=HIGH_SALARY,
            number_of_children=1,
            children_with_disabilities_count=5,
        )
    )

    assert result.calculation_details.family_allowances == CURRENT_SCALE.child_disability_allowance


def test_life_insurance_deduction_is_capped() -> None:
    result = calculate_income_tax(
        IncomeTaxRequest(gross_monthly_salary=HIGH_SALARY, life_insurance=Decimal(1000000))
    )

    assert result.calculation_details.personal_deductions == CURRENT_SCALE.life_insurance_annual_cap


def test_allowed_deductions_always_include_the_exemption_and_the_special_deduction() -> None:
    result = calculate_income_tax(IncomeTaxRequest(gross_monthly_salary=HIGH_SALARY))

    details = result.calculation_details
    assert details.minimum_exemption == CURRENT_SCALE.minimum_exemption
    assert details.special_deduction == CURRENT_SCALE.special_deduction
    assert details.total_allowed_deductions == (
        CURRENT_SCALE.minimum_exemption
        + CURRENT_SCALE.special_deduction
        + details.family_allowances
        + details.personal_deductions
    )


def test_deductions_lower_the_tax() -> None:
    plain = calculate_income_tax(IncomeTaxRequest(gross_monthly_salary=HIGH_SALARY))
    with_family = calculate_income_tax(
        IncomeTaxRequest(gross_monthly_salary=HIGH_SALARY, has_spouse=True, number_of_children=3)
    )

    assert with_family.annual_tax < plain.annual_tax


def test_first_bracket_is_taxed_at_its_own_rate() -> None:
    first = CURRENT_SCALE.brackets[0]
    total, breakdown = _tax_by_brackets(first.to_amount)

    assert len(breakdown) == 1
    assert total == (first.to_amount * first.rate / Decimal(100)).quantize(Decimal("0.01"))


def test_income_spanning_two_brackets_is_taxed_progressively() -> None:
    first, second = CURRENT_SCALE.brackets[0], CURRENT_SCALE.brackets[1]
    excess = Decimal(1000)
    total, breakdown = _tax_by_brackets(first.to_amount + excess)

    expected_first = (first.to_amount * first.rate / Decimal(100)).quantize(Decimal("0.01"))
    expected_second = (excess * second.rate / Decimal(100)).quantize(Decimal("0.01"))
    assert len(breakdown) == 2
    assert breakdown[0].bracket == 1
    assert breakdown[1].bracket == 2
    assert total == expected_first + expected_second


def test_no_taxable_income_produces_no_brackets() -> None:
    total, breakdown = _tax_by_brackets(Decimal(0))

    assert total == Decimal(0)
    assert breakdown == []


def test_tax_grows_with_salary() -> None:
    lower = calculate_income_tax(IncomeTaxRequest(gross_monthly_salary=HIGH_SALARY))
    higher = calculate_income_tax(IncomeTaxRequest(gross_monthly_salary=HIGH_SALARY * 2))

    assert higher.annual_tax > lower.annual_tax
    assert higher.effective_rate > lower.effective_rate


def test_every_answer_carries_the_period_and_the_source_of_the_scale() -> None:
    result = calculate_income_tax(IncomeTaxRequest(gross_monthly_salary=HIGH_SALARY))

    assert result.scale.effective_from == CURRENT_SCALE.effective_from
    assert result.scale.period_label == CURRENT_SCALE.period_label
    assert "ARCA" in result.scale.source
    assert result.scale.source_url.startswith("https://")


def test_the_scale_is_a_continuous_ladder_of_growing_rates() -> None:
    brackets = CURRENT_SCALE.brackets

    assert brackets[0].from_amount == Decimal(0)
    for lower, higher in pairwise(brackets):
        assert lower.to_amount == higher.from_amount
        assert lower.rate < higher.rate
