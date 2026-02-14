package com.finarg.shared.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum CurrencyType {
    AR_OFFICIAL("oficial", "Official", Country.ARGENTINA, "usd", true),
    AR_BLUE("blue", "Blue", Country.ARGENTINA, "usd", true),
    AR_MEP("bolsa", "MEP/Stock", Country.ARGENTINA, "usd", true),
    AR_CCL("contadoconliqui", "CCL", Country.ARGENTINA, "usd", true),
    AR_CARD("tarjeta", "Card", Country.ARGENTINA, "usd", true),
    AR_WHOLESALE("mayorista", "Wholesale", Country.ARGENTINA, "usd", true),
    AR_CRYPTO("cripto", "Crypto", Country.ARGENTINA, "usd", true),
    AR_EUR_OFICIAL("eur_oficial", "Euro Oficial", Country.ARGENTINA, "eur", true),
    AR_EUR_BLUE("eur_blue", "Euro Blue", Country.ARGENTINA, "eur", false),
    AR_EUR_TARJETA("eur_tarjeta", "Euro Tarjeta", Country.ARGENTINA, "eur", false),
    AR_BRL_OFICIAL("brl_oficial", "Real Oficial", Country.ARGENTINA, "brl", true),
    AR_BRL_BLUE("brl_blue", "Real Blue", Country.ARGENTINA, "brl", false),
    AR_BRL_TARJETA("brl_tarjeta", "Real Tarjeta", Country.ARGENTINA, "brl", false),
    AR_CLP_OFICIAL("clp_oficial", "Peso Chileno Oficial", Country.ARGENTINA, "clp", true),
    AR_CLP_BLUE("clp_blue", "Peso Chileno Blue", Country.ARGENTINA, "clp", false),
    AR_CLP_TARJETA("clp_tarjeta", "Peso Chileno Tarjeta", Country.ARGENTINA, "clp", false),
    AR_UYU_OFICIAL("uyu_oficial", "Peso Uruguayo Oficial", Country.ARGENTINA, "uyu", true),
    AR_UYU_BLUE("uyu_blue", "Peso Uruguayo Blue", Country.ARGENTINA, "uyu", false),
    AR_UYU_TARJETA("uyu_tarjeta", "Peso Uruguayo Tarjeta", Country.ARGENTINA, "uyu", false),
    AR_PYG_OFICIAL("pyg_oficial", "Guaraní Paraguayo Oficial", Country.ARGENTINA, "pyg", true),
    AR_PYG_BLUE("pyg_blue", "Guaraní Paraguayo Blue", Country.ARGENTINA, "pyg", false),
    AR_PYG_TARJETA("pyg_tarjeta", "Guaraní Paraguayo Tarjeta", Country.ARGENTINA, "pyg", false),
    AR_BOB_OFICIAL("bob_oficial", "Boliviano Oficial", Country.ARGENTINA, "bob", true),
    AR_BOB_BLUE("bob_blue", "Boliviano Blue", Country.ARGENTINA, "bob", false),
    AR_BOB_TARJETA("bob_tarjeta", "Boliviano Tarjeta", Country.ARGENTINA, "bob", false),
    AR_CNY_OFICIAL("cny_oficial", "Yuan Oficial", Country.ARGENTINA, "cny", true),
    AR_CNY_BLUE("cny_blue", "Yuan Blue", Country.ARGENTINA, "cny", false),
    AR_CNY_TARJETA("cny_tarjeta", "Yuan Tarjeta", Country.ARGENTINA, "cny", false),

    CO_TRM("trm", "TRM (Representative Rate)", Country.COLOMBIA, "cop", true),
    CO_EXCHANGE_HOUSES("casas", "Exchange Houses", Country.COLOMBIA, "cop", true),
    CO_CRYPTO("cripto", "Crypto P2P", Country.COLOMBIA, "cop", true),

    BR_COMMERCIAL("comercial", "Commercial", Country.BRAZIL, "brl", true),
    BR_TOURISM("turismo", "Tourism", Country.BRAZIL, "brl", true),
    BR_PTAX("ptax", "PTAX (BCB)", Country.BRAZIL, "brl", true),
    BR_PARALLEL("paralelo", "Parallel", Country.BRAZIL, "brl", true),

    // Chile
    CL_OBSERVED("observado", "Observed Dollar", Country.CHILE, "clp", true),
    CL_INFORMAL("informal", "Informal", Country.CHILE, "clp", true),
    CL_CRYPTO("cripto", "Crypto P2P", Country.CHILE, "clp", true),

    // Uruguay
    UY_INTERBANK("interbancario", "Interbank", Country.URUGUAY, "uyu", true),
    UY_BILL("billete", "Bill", Country.URUGUAY, "uyu", true),
    UY_EBROU("ebrou", "eBROU", Country.URUGUAY, "uyu", true);

    @JsonValue
    private final String code;
    private final String name;
    private final Country country;
    private final String baseCurrency;
    private final boolean hasHistory;

    CurrencyType(String code, String name, Country country, String baseCurrency, boolean hasHistory) {
        this.code = code;
        this.name = name;
        this.country = country;
        this.baseCurrency = baseCurrency;
        this.hasHistory = hasHistory;
    }

    public static CurrencyType fromCode(String code, Country country) {
        for (CurrencyType type : values()) {
            if (type.code.equalsIgnoreCase(code) && type.country == country) {
                return type;
            }
        }
        for (CurrencyType type : values()) {
            if (type.name().equalsIgnoreCase(code) && type.country == country) {
                return type;
            }
        }
        throw new IllegalArgumentException("Currency type not found: " + code + " for " + country);
    }

    public static CurrencyType[] valuesForCountry(Country country) {
        return java.util.Arrays.stream(values())
                .filter(t -> t.country == country)
                .toArray(CurrencyType[]::new);
    }
}
