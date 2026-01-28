package com.finarg.model.enums;

import lombok.Getter;

@Getter
public enum CurrencyType {
    // Argentina
    AR_OFFICIAL("oficial", "Official", Country.ARGENTINA),
    AR_BLUE("blue", "Blue", Country.ARGENTINA),
    AR_MEP("bolsa", "MEP/Stock", Country.ARGENTINA),
    AR_CCL("contadoconliqui", "CCL", Country.ARGENTINA),
    AR_CARD("tarjeta", "Card", Country.ARGENTINA),
    AR_WHOLESALE("mayorista", "Wholesale", Country.ARGENTINA),
    AR_CRYPTO("cripto", "Crypto", Country.ARGENTINA),

    // Colombia
    CO_TRM("trm", "TRM (Representative Rate)", Country.COLOMBIA),
    CO_EXCHANGE_HOUSES("casas", "Exchange Houses", Country.COLOMBIA),
    CO_CRYPTO("cripto", "Crypto P2P", Country.COLOMBIA),

    // Brazil
    BR_COMMERCIAL("comercial", "Commercial", Country.BRAZIL),
    BR_TOURISM("turismo", "Tourism", Country.BRAZIL),
    BR_PTAX("ptax", "PTAX (BCB)", Country.BRAZIL),
    BR_PARALLEL("paralelo", "Parallel", Country.BRAZIL),

    // Chile
    CL_OBSERVED("observado", "Observed Dollar", Country.CHILE),
    CL_INFORMAL("informal", "Informal", Country.CHILE),
    CL_CRYPTO("cripto", "Crypto P2P", Country.CHILE),

    // Uruguay
    UY_INTERBANK("interbancario", "Interbank", Country.URUGUAY),
    UY_BILL("billete", "Bill", Country.URUGUAY),
    UY_EBROU("ebrou", "eBROU", Country.URUGUAY);

    private final String code;
    private final String name;
    private final Country country;

    CurrencyType(String code, String name, Country country) {
        this.code = code;
        this.name = name;
        this.country = country;
    }

    public static CurrencyType fromCode(String code, Country country) {
        for (CurrencyType type : values()) {
            if (type.code.equalsIgnoreCase(code) && type.country == country) {
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
