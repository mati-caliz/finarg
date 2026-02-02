package com.finarg.service;

import com.finarg.client.ArgentinaDatosClient;
import com.finarg.client.ArgentinaDatosClient.FciRateResponse;
import com.finarg.client.ArgentinaDatosClient.FixedTermRateResponse;
import com.finarg.model.dto.RateDTO;
import com.finarg.model.enums.Country;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RatesService {

    private static final String ROW_SEPARATOR_LABEL = "Otros bancos que informan";
    private static final String GOOGLE_FAVICON_API = "https://www.google.com/s2/favicons?domain=%s&sz=128";
    private static final Map<String, String> WALLET_DOMAINS = Map.ofEntries(
            Map.entry("BELO", "belo.app"),
            Map.entry("BNA", "bna.com.ar"),
            Map.entry("BRUBANK", "brubank.com"),
            Map.entry("CARREFOUR BANCO", "carrefour.com.ar"),
            Map.entry("CRESIUM", "cresium.com.ar"),
            Map.entry("FIWIND", "fiwind.com"),
            Map.entry("MONTEMAR PAY", "montemar.com.ar"),
            Map.entry("NARANJA X", "naranjax.com"),
            Map.entry("SUPERVIELLE", "supervielle.com.ar"),
            Map.entry("UALA", "uala.com.ar"),
            Map.entry("UALA PLUS 1", "uala.com.ar"),
            Map.entry("UALA PLUS 2", "uala.com.ar")
    );

    private final ArgentinaDatosClient argentinaDatosClient;

    @Cacheable(value = "rates", key = "'fixedTerm_' + #country + '_v2'")
    public List<RateDTO> getFixedTermRates(Country country) {
        if (country != Country.ARGENTINA) {
            return List.of();
        }
        List<FixedTermRateResponse> raw = argentinaDatosClient.getFixedTermRates();
        if (raw == null) {
            return List.of();
        }
        return raw.stream()
                .filter(r -> r.getEntity() != null && !r.getEntity().contains(ROW_SEPARATOR_LABEL))
                .filter(this::hasValidTna)
                .map(this::mapToRateDTO)
                .sorted((a, b) -> b.getTna().compareTo(a.getTna()))
                .toList();
    }

    @Cacheable(value = "rates", key = "'wallets_' + #country + '_v8'")
    public List<RateDTO> getWalletRates(Country country) {
        if (country != Country.ARGENTINA) {
            return List.of();
        }
        List<FciRateResponse> raw = argentinaDatosClient.getWalletFciRates();
        if (raw == null) {
            return List.of();
        }
        return raw.stream()
                .filter(r -> r.getFund() != null && r.getTna() != null && r.getTna().compareTo(BigDecimal.ZERO) > 0)
                .map(this::mapFciToRateDTO)
                .sorted((a, b) -> b.getTna().compareTo(a.getTna()))
                .toList();
    }

    @Cacheable(value = "rates", key = "'usdAccounts_' + #country + '_v1'")
    public List<RateDTO> getUsdAccountRates(Country country) {
        if (country != Country.ARGENTINA) {
            return List.of();
        }
        List<ArgentinaDatosClient.UsdAccountResponse> accounts = argentinaDatosClient.getUsdAccounts();
        List<ArgentinaDatosClient.YieldResponse> yields = argentinaDatosClient.getYields();
        
        java.util.List<RateDTO> result = new java.util.ArrayList<>();
        
        if (accounts != null) {
            accounts.stream()
                    .filter(r -> r.getEntity() != null && r.getTna() != null && r.getTna().compareTo(BigDecimal.ZERO) > 0)
                    .map(this::mapUsdAccountToRateDTO)
                    .forEach(result::add);
        }
        
        if (yields != null) {
            yields.stream()
                    .filter(r -> r.getEntity() != null && r.getTna() != null && r.getTna().compareTo(BigDecimal.ZERO) > 0)
                    .map(this::mapYieldToRateDTO)
                    .forEach(result::add);
        }
        
        result.sort((a, b) -> b.getTna().compareTo(a.getTna()));
        return result;
    }

    private RateDTO mapFciToRateDTO(FciRateResponse r) {
        BigDecimal tnaPct = r.getTna().multiply(BigDecimal.valueOf(100));
        BigDecimal teaPct = r.getTea() != null
                ? r.getTea().multiply(BigDecimal.valueOf(100))
                : teaFromTna(r.getTna()).multiply(BigDecimal.valueOf(100));
        String fundName = formatFundName(r.getFund());
        String logo = walletLogoUrl(r.getFund());
        return RateDTO.builder()
                .id(sanitizeId(r.getFund()))
                .name(fundName)
                .tna(tnaPct.setScale(1, RoundingMode.HALF_UP))
                .tea(teaPct.setScale(1, RoundingMode.HALF_UP))
                .product(r.getConditionsShort())
                .term(null)
                .date(r.getDate())
                .limit(r.getLimit())
                .logo(logo)
                .link(null)
                .build();
    }

    private static String formatFundName(String fund) {
        if (fund == null || fund.isBlank()) return "";
        return fixMojibake(fund.trim());
    }

    private static String walletLogoUrl(String fund) {
        if (fund == null || fund.isBlank()) return null;
        String domain = WALLET_DOMAINS.get(fund.toUpperCase().trim());
        if (domain != null) {
            return String.format(GOOGLE_FAVICON_API, domain);
        }
        String baseName = fund.toUpperCase().trim()
                .replaceAll("\\s+PLUS\\s+\\d+", "")
                .replaceAll("\\s+BANCO\\b", "")
                .replaceAll("\\s+X\\b", "X")
                .replaceAll("\\s+PAY\\b", "")
                .replaceAll("\\s+", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9]", "");
        if (baseName.isEmpty()) return null;
        return String.format(GOOGLE_FAVICON_API, baseName + ".com.ar");
    }

    private boolean hasValidTna(FixedTermRateResponse r) {
        BigDecimal tna = bestTna(r);
        return tna != null && tna.compareTo(BigDecimal.ZERO) > 0;
    }

    private BigDecimal bestTna(FixedTermRateResponse r) {
        if (r.getTnaClients() != null && r.getTnaNonClients() != null) {
            return r.getTnaClients().max(r.getTnaNonClients());
        }
        if (r.getTnaClients() != null) {
            return r.getTnaClients();
        }
        return r.getTnaNonClients();
    }

    private RateDTO mapToRateDTO(FixedTermRateResponse r) {
        BigDecimal tna = bestTna(r);
        BigDecimal tnaPct = tna.multiply(BigDecimal.valueOf(100));
        BigDecimal teaPct = teaFromTna(tna).multiply(BigDecimal.valueOf(100));
        String shortName = shortenBankName(r.getEntity());
        return RateDTO.builder()
                .id(sanitizeId(shortName))
                .name(shortName)
                .tna(tnaPct.setScale(1, RoundingMode.HALF_UP))
                .tea(teaPct.setScale(1, RoundingMode.HALF_UP))
                .term("30 días")
                .date(null)
                .limit(null)
                .logo(r.getLogo())
                .link(r.getLink())
                .build();
    }

    private static BigDecimal teaFromTna(BigDecimal tna) {
        return BigDecimal.ONE.add(tna.divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP))
                .pow(12)
                .subtract(BigDecimal.ONE);
    }

    private static final java.util.Set<String> SKIP_WORDS = java.util.Set.of(
            "DE", "DEL", "LA", "EL", "LOS", "LAS", "Y", "AND", "OF", "EN", "ARGENTINA", "SA", "S.A", "S.A.U",
            "LIMITADO", "COOPERATIVO", "BUENOS", "AIRES", "TIERRA", "FUEGO");

    private static String shortenBankName(String entityName) {
        if (entityName == null || entityName.isBlank()) {
            return "";
        }
        String fixed = fixMojibake(entityName);
        String upper = fixed.toUpperCase().trim();
        String cleaned = upper
                .replaceAll("SOCIEDAD ANONIMA", " ")
                .replaceAll("S\\.?A\\.?U\\.?", " ")
                .replaceAll("S\\.?A\\.?", " ")
                .replaceAll("LIMITADO", " ")
                .replaceAll("COOPERATIVO", " ")
                .replaceAll("COMPAÑÍA FINANCIERA", " ")
                .replaceAll("COMPANIA FINANCIERA", " ")
                .replaceAll("\\s+", " ")
                .trim();

        if (cleaned.contains("INDUSTRIAL AND COMMERCIAL") || cleaned.startsWith("ICBC ")) {
            return "ICBC";
        }

        String result;
        if (cleaned.startsWith("BANCO DE LA ")) {
            result = extractFirstWords(cleaned.substring(12), 2, "Banco ");
        } else if (cleaned.startsWith("BANCO DEL ")) {
            result = extractFirstWords(cleaned.substring(10), 1, "Banco ");
        } else if (cleaned.startsWith("BANCO DE ")) {
            result = extractFirstWords(cleaned.substring(9), 1, "Banco ");
        } else if (cleaned.startsWith("BANCO ")) {
            result = extractFirstWords(cleaned.substring(6), 2, "");
        } else {
            result = extractFirstWords(cleaned, 2, "");
        }

        return titleCase(result).trim();
    }

    private static String extractFirstWords(String text, int maxWords, String prefix) {
        String[] words = text.split("\\s+");
        StringBuilder sb = new StringBuilder(prefix);
        int count = 0;
        for (String w : words) {
            if (w.isEmpty() || SKIP_WORDS.contains(w)) continue;
            if (count >= maxWords) break;
            if (sb.length() > prefix.length()) sb.append(" ");
            sb.append(w);
            count++;
        }
        return sb.toString();
    }

    private static String titleCase(String s) {
        if (s == null || s.isEmpty()) return s;
        return java.util.Arrays.stream(s.split("\\s+"))
                .map(word -> {
                    if (word.isEmpty()) return "";
                    if (word.length() >= 2 && word.length() <= 5 && word.chars().allMatch(Character::isUpperCase)) {
                        return word;
                    }
                    return word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase();
                })
                .reduce((a, b) -> a + " " + b)
                .orElse(s);
    }

    private static String fixMojibake(String s) {
        if (s == null || s.isEmpty()) return s;
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

    private static String sanitizeId(String name) {
        if (name == null) {
            return UUID.randomUUID().toString();
        }
        return name.toLowerCase()
                .replaceAll("[^a-z0-9]", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_|_$", "");
    }

    private RateDTO mapUsdAccountToRateDTO(ArgentinaDatosClient.UsdAccountResponse r) {
        BigDecimal tnaPct = r.getTna().multiply(BigDecimal.valueOf(100));
        BigDecimal teaPct = r.getTea() != null
                ? r.getTea().multiply(BigDecimal.valueOf(100))
                : teaFromTna(r.getTna()).multiply(BigDecimal.valueOf(100));
        String entityName = formatFundName(r.getEntity());
        return RateDTO.builder()
                .id(sanitizeId(r.getEntity()))
                .name(entityName)
                .tna(tnaPct.setScale(1, RoundingMode.HALF_UP))
                .tea(teaPct.setScale(1, RoundingMode.HALF_UP))
                .product(r.getConditions())
                .term(null)
                .date(r.getDate())
                .limit(r.getLimit())
                .logo(null)
                .link(null)
                .build();
    }

    private RateDTO mapYieldToRateDTO(ArgentinaDatosClient.YieldResponse r) {
        BigDecimal tnaPct = r.getTna().multiply(BigDecimal.valueOf(100));
        BigDecimal teaPct = r.getTea() != null
                ? r.getTea().multiply(BigDecimal.valueOf(100))
                : teaFromTna(r.getTna()).multiply(BigDecimal.valueOf(100));
        String entityName = formatFundName(r.getEntity());
        return RateDTO.builder()
                .id(sanitizeId(r.getEntity()))
                .name(entityName)
                .tna(tnaPct.setScale(1, RoundingMode.HALF_UP))
                .tea(teaPct.setScale(1, RoundingMode.HALF_UP))
                .product(r.getProduct())
                .term(null)
                .date(r.getDate())
                .limit(r.getLimit())
                .logo(null)
                .link(null)
                .build();
    }
}
