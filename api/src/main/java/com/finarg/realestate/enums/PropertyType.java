package com.finarg.realestate.enums;

import lombok.Getter;

@Getter
public enum PropertyType {
    APARTMENT("apartment", "Departamento"),
    HOUSE("house", "Casa"),
    PH("ph", "PH"),
    LAND("land", "Terreno"),
    OFFICE("office", "Oficina"),
    COMMERCIAL("commercial", "Local Comercial");

    private final String code;
    private final String displayName;

    PropertyType(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

}
