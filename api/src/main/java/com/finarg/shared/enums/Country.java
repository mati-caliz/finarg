package com.finarg.shared.enums;

import lombok.Getter;

@Getter
public enum Country {
    ARGENTINA("ar", "Argentina", "ARS", "es-AR"),
    COLOMBIA("co", "Colombia", "COP", "es-CO"),
    BRAZIL("br", "Brazil", "BRL", "pt-BR"),
    CHILE("cl", "Chile", "CLP", "es-CL"),
    URUGUAY("uy", "Uruguay", "UYU", "es-UY");

    private final String code;
    private final String name;
    private final String localCurrency;
    private final String locale;

    Country(String code, String name, String localCurrency, String locale) {
        this.code = code;
        this.name = name;
        this.localCurrency = localCurrency;
        this.locale = locale;
    }

    public static Country fromCode(String code) {
        for (Country country : values()) {
            if (country.code.equalsIgnoreCase(code)) {
                return country;
            }
        }
        throw new IllegalArgumentException("Country not found: " + code);
    }
}
