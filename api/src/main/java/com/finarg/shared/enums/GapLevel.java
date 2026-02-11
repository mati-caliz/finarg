package com.finarg.shared.enums;

public enum GapLevel {
    LOW(0, 30),
    MEDIUM(30, 60),
    HIGH(60, Double.MAX_VALUE);

    private final double minPercent;
    private final double maxPercent;

    GapLevel(double minPercent, double maxPercent) {
        this.minPercent = minPercent;
        this.maxPercent = maxPercent;
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
