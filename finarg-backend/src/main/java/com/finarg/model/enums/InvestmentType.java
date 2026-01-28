package com.finarg.model.enums;

import lombok.Getter;

public enum InvestmentType {
    FIXED_TERM("plazo_fijo", "Fixed Term Deposit"),
    FIXED_TERM_UVA("plazo_fijo_uva", "UVA Fixed Term"),
    MONEY_MARKET_FUND("fci_money_market", "Money Market Fund"),
    FIXED_INCOME_FUND("fci_renta_fija", "Fixed Income Fund"),
    REPO("caucion", "Repo/Caucion"),
    STABLECOIN_DAI("stablecoin_dai", "DAI Stablecoin"),
    STABLECOIN_USDT("stablecoin_usdt", "USDT Stablecoin");

    @Getter
    private final String name;

    InvestmentType(String code, String name) {
        this.name = name;
    }

}
