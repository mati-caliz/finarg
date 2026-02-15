package com.finarg.news.enums;

import com.finarg.shared.constants.UiColors;
import lombok.Getter;

@Getter
public enum AiSentiment {
    POSITIVE("Positivo", UiColors.GREEN),
    NEUTRAL("Neutral", "#64748b"),
    NEGATIVE("Negativo", UiColors.RED),
    MIXED("Mixto", "#f59e0b");

    private final String displayName;
    private final String color;

    AiSentiment(String displayName, String color) {
        this.displayName = displayName;
        this.color = color;
    }
}
