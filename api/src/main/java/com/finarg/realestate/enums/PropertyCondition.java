package com.finarg.realestate.enums;

import lombok.Getter;

@Getter
public enum PropertyCondition {
    NEW("new", "A Estrenar"),
    EXCELLENT("excellent", "Excelente"),
    GOOD("good", "Bueno"),
    TO_REFURBISH("to_refurbish", "A Refaccionar"),
    UNDER_CONSTRUCTION("under_construction", "En Construcción");

    private final String code;
    private final String displayName;

    PropertyCondition(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

}
