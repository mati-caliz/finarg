package com.finarg.shared.util;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

public final class StringUtils {

    private StringUtils() { }

    public static String orEmpty(String value) {
        return value != null ? value : "";
    }

    public static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) {
                return v;
            }
        }
        return "";
    }

    public static String sanitizeId(String name) {
        if (name == null) {
            return UUID.randomUUID().toString();
        }
        return name.toLowerCase()
                .replaceAll("[^a-z0-9]", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_|_$", "");
    }

    public static String fixMojibake(String s) {
        if (s == null || s.isEmpty()) {
            return s;
        }
        if (s.contains("Ã")) {
            try {
                String decoded = new String(s.getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.UTF_8);
                if (!decoded.contains("Ã")) {
                    return decoded;
                }
            } catch (Exception ignored) {
            }
        }
        return s.replace("Ã©", "é")
                .replace("Ã‰", "É")
                .replace("Ã­", "í")
                .replace("Ã±", "ñ")
                .replace("Ã'", "Ñ")
                .replace("ÃÃA", "ÑÍA")
                .replace("ÃIA", "ÑÍA")
                .replace("Ãia", "Ñía")
                .replace("Ã³", "ó")
                .replace("Ãº", "ú")
                .replace("Ã¡", "á")
                .replace("ÃDITO", "ÉDITO")
                .replace("Ãdito", "édito");
    }
}
