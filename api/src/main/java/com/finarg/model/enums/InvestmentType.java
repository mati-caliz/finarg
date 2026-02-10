package com.finarg.model.enums;

import lombok.Getter;

public enum InvestmentType {
    FIXED_TERM("Fixed Term Deposit"),
    FIXED_TERM_UVA("UVA Fixed Term"),
    MONEY_MARKET_FUND("Money Market Fund"),
    FIXED_INCOME_FUND("Fixed Income Fund"),
    REPO("Repo/Caucion"),
    STABLECOIN_DAI("DAI Stablecoin"),
    STABLECOIN_USDT("USDT Stablecoin");

    @Getter
    private final String name;

    InvestmentType(String name) {
        this.name = name;
    }

}
