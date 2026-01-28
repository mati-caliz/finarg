package com.finarg.model.enums;

import lombok.Getter;

public enum DollarType {
    OFFICIAL("oficial", "Official"),
    BLUE("blue", "Blue"),
    MEP("bolsa", "MEP/Stock"),
    CCL("contadoconliqui", "CCL"),
    CARD("tarjeta", "Card"),
    WHOLESALE("mayorista", "Wholesale"),
    CRYPTO("cripto", "Crypto");

    @Getter
    private final String name;

    DollarType(String code, String name) {
        this.name = name;
    }

}
