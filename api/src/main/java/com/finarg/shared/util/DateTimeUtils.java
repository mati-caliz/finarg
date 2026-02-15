package com.finarg.shared.util;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

public final class DateTimeUtils {

    private DateTimeUtils() { }

    public static LocalDateTime now() {
        return LocalDateTime.now();
    }

    public static LocalDateTime fromEpochMillis(Long epochMillis) {
        if (epochMillis == null) {
            return LocalDateTime.now();
        }
        return LocalDateTime.ofInstant(Instant.ofEpochMilli(epochMillis), ZoneId.systemDefault());
    }

    public static LocalDateTime fromEpochSeconds(Long epochSeconds) {
        if (epochSeconds == null) {
            return LocalDateTime.now();
        }
        return LocalDateTime.ofInstant(Instant.ofEpochSecond(epochSeconds), ZoneId.systemDefault());
    }
}
