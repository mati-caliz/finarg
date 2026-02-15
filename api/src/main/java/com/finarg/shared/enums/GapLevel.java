package com.finarg.shared.enums;

import com.finarg.shared.constants.UiColors;
import lombok.Getter;

public enum GapLevel {
    LOW(0, 30, UiColors.GREEN, "Low gap - Stable market"),
    MEDIUM(30, 60, UiColors.YELLOW, "Moderate gap - Attention"),
    HIGH(60, Double.MAX_VALUE, UiColors.RED, "High gap - Exchange tension");

    private final double minPercent;
    private final double maxPercent;
    @Getter
    private final String color;
    @Getter
    private final String description;

    GapLevel(double minPercent, double maxPercent, String color, String description) {
        this.minPercent = minPercent;
        this.maxPercent = maxPercent;
        this.color = color;
        this.description = description;
    }

    public static GapLevel fromPercentage(double percentage) {
        percentage = Math.abs(percentage);
        for (GapLevel level : values()) {
            if (percentage >= level.minPercent && percentage < level.maxPercent) {
                return level;
            }
        }
        return HIGH;
    }
}
