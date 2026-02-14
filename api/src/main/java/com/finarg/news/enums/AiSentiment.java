package com.finarg.news.enums;

import lombok.Getter;

@Getter
public enum AiSentiment {
    POSITIVE("Positivo", "#22c55e"),
    NEUTRAL("Neutral", "#64748b"),
    NEGATIVE("Negativo", "#ef4444"),
    MIXED("Mixto", "#f59e0b");

    private final String displayName;
    private final String color;

    AiSentiment(String displayName, String color) {
        this.displayName = displayName;
        this.color = color;
    }
}
