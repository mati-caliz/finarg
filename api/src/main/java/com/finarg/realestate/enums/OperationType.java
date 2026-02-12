package com.finarg.realestate.enums;

import lombok.Getter;

@Getter
public enum OperationType {
    SALE("sale", "Venta"),
    RENT("rent", "Alquiler");

    private final String code;
    private final String displayName;

    OperationType(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

}
