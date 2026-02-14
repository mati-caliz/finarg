package com.finarg.shared.enums;

public enum GapLevel {
    LOW(0, 30, "#22c55e", "Low gap - Stable market"),
    MEDIUM(30, 60, "#eab308", "Moderate gap - Attention"),
    HIGH(60, Double.MAX_VALUE, "#ef4444", "High gap - Exchange tension");

    private final double minPercent;
    private final double maxPercent;
    private final String color;
    private final String description;

    GapLevel(double minPercent, double maxPercent, String color, String description) {
        this.minPercent = minPercent;
        this.maxPercent = maxPercent;
        this.color = color;
        this.description = description;
    }

    public String getColor() {
        return color;
    }

    public String getDescription() {
        return description;
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
