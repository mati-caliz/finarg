package com.finarg.news.enums;

import lombok.Getter;

@Getter
public enum NewsCategory {
    EXCHANGE_RATE("Tipo de Cambio"),
    MONETARY_POLICY("Política Monetaria"),
    INFLATION("Inflación"),
    RESERVES("Reservas"),
    FISCAL_POLICY("Política Fiscal"),
    FINANCIAL_MARKETS("Mercados Financieros"),
    ECONOMY_GENERAL("Economía General"),
    CRYPTO("Criptomonedas"),
    INTERNATIONAL("Internacional"),
    BCRA_BULLETIN("Boletín BCRA"),
    GOVERNMENT_BULLETIN("Boletín Oficial");

    private final String displayName;

    NewsCategory(String displayName) {
        this.displayName = displayName;
    }
}
