package com.finarg.service;

import com.finarg.client.ArgentinaDatosClient;
import com.finarg.client.ArgentinaDatosClient.FciRateResponse;
import com.finarg.client.ArgentinaDatosClient.FixedTermRateResponse;
import com.finarg.client.FciClient;
import com.finarg.model.dto.RateDTO;
import com.finarg.model.enums.Country;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RatesService {

    private static final String ROW_SEPARATOR_LABEL = "Otros bancos que informan";
    private static final String GOOGLE_FAVICON_API = "https://www.google.com/s2/favicons?domain=%s&sz=128";
    private static final Map<String, String> WALLET_DOMAINS = Map.ofEntries(
            Map.entry("ADCAP", "ad-cap.com.ar"),
            Map.entry("BALANZ", "balanz.com"),
            Map.entry("BELO", "belo.app"),
            Map.entry("BNA", "bna.com.ar"),
            Map.entry("BRUBANK", "brubank.com"),
            Map.entry("CARREFOUR BANCO", "carrefour.com.ar"),
            Map.entry("CLARO PAY", "claropay.com.ar"),
            Map.entry("CRESIUM", "cresium.com.ar"),
            Map.entry("FIWIND", "fiwind.com"),
            Map.entry("GALICIA", "galicia.com.ar"),
            Map.entry("ICBC", "icbc.com.ar"),
            Map.entry("IEB+", "ieb.com.ar"),
            Map.entry("IOL (INVERTIRONLINE)", "iol.com.ar"),
            Map.entry("IOL", "iol.com.ar"),
            Map.entry("LEMON", "lemon.me"),
            Map.entry("MACRO", "macro.com.ar"),
            Map.entry("MERCADO PAGO", "mercadopago.com.ar"),
            Map.entry("MONTEMAR PAY", "montemar.com.ar"),
            Map.entry("NARANJA X", "naranjax.com"),
            Map.entry("PERSONAL PAY", "personalpay.com.ar"),
            Map.entry("PREX", "prex.com.ar"),
            Map.entry("SUPERVIELLE", "supervielle.com.ar"),
            Map.entry("TORONTO AHORRO", "torontotrust.com.ar"),
            Map.entry("UALA", "uala.com.ar"),
            Map.entry("UALÁ", "uala.com.ar"),
            Map.entry("UALA PLUS 1", "uala.com.ar"),
            Map.entry("UALA PLUS 2", "uala.com.ar")
    );

    private static final Map<String, String> BANK_DOMAINS = Map.ofEntries(
            Map.entry("BANCO NACIÓN", "bna.com.ar"),
            Map.entry("BBVA", "bbva.com.ar"),
            Map.entry("BANCO DEL SOL", "bancodelsol.ar"),
            Map.entry("BANCO CIUDAD", "bancociudad.com.ar"),
            Map.entry("COMAFI", "comafi.com.ar"),
            Map.entry("ICBC", "icbc.com.ar"),
            Map.entry("BRUBANK", "brubank.com"),
            Map.entry("CREDICOOP", "bancocredicoop.coop"),
            Map.entry("BANCO HIPOTECARIO", "hipotecario.com.ar"),
            Map.entry("BANCO PATAGONIA", "bancopatagonia.com.ar"),
            Map.entry("SUPERVIELLE", "supervielle.com.ar"),
            Map.entry("SANTANDER", "santander.com.ar"),
            Map.entry("BANCO MACRO", "macro.com.ar"),
            Map.entry("BANCO GALICIA", "galicia.com.ar")
    );

    private final ArgentinaDatosClient argentinaDatosClient;
    private final FciClient fciClient;

    private static final Map<String, String> FCI_TO_WALLET_MAPPING = Map.ofEntries(
            Map.entry("Allaria Ahorro - Clase E", "Prex"),
            Map.entry("Adcap Ahorro Pesos Fondo de Dinero - Clase A", "Adcap"),
            Map.entry("Premier Renta CP en Pesos - Clase A", "Supervielle"),
            Map.entry("Ualintec Ahorro Pesos - Clase A", "Ualá"),
            Map.entry("Delta Pesos - Clase X", "Personal Pay"),
            Map.entry("Balanz Capital Money Market - Clase A", "Balanz"),
            Map.entry("IEB Ahorro - Clase A", "IEB+"),
            Map.entry("Mercado Fondo - Clase A", "Mercado Pago"),
            Map.entry("Toronto Trust Ahorro - Clase A", "Toronto Ahorro"),
            Map.entry("Fima Premium - Clase P", "Lemon"),
            Map.entry("Super Ahorro $ - Clase A", "Santander"),
            Map.entry("Alpha Pesos - Clase A", "ICBC"),
            Map.entry("Pionero Pesos - Clase A", "Macro"),
            Map.entry("Fima Premium - Clase A", "Galicia"),
            Map.entry("SBS Ahorro Pesos - Clase A", "Claro Pay"),
            Map.entry("Delta Pesos - Clase A", "Fiwind"),
            Map.entry("SBS Ahorro Pesos - Clase B", "Brubank")
    );

    @Cacheable(value = "rates", key = "'fixedTerm_' + #country + '_v3'")
    public List<RateDTO> getFixedTermRates(Country country) {
        if (country != Country.ARGENTINA) {
            return List.of();
        }
        List<FixedTermRateResponse> raw = argentinaDatosClient.getFixedTermRates();
        if (raw == null) {
            return List.of();
        }
        List<RateDTO> sorted = raw.stream()
                .filter(r -> r.getEntity() != null && !r.getEntity().contains(ROW_SEPARATOR_LABEL))
                .filter(this::hasValidTna)
                .map(this::mapToRateDTO)
                .sorted((a, b) -> b.getTna().compareTo(a.getTna()))
                .toList();
        return markBestRate(sorted);
    }

    @Cacheable(value = "rates", key = "'wallets_' + #country + '_v13'")
    public List<RateDTO> getWalletRates(Country country) {
        if (country != Country.ARGENTINA) {
            return List.of();
        }

        Map<String, BigDecimal> fciTnas = fciClient.calculateAllTnas();
        Set<String> fciWalletNames = new HashSet<>(FCI_TO_WALLET_MAPPING.values());

        List<RateDTO> result = new ArrayList<>();

        List<FciRateResponse> raw = argentinaDatosClient.getWalletFciRates();
        if (raw != null) {
            raw.stream()
                    .filter(r -> r.getFund() != null && r.getTna() != null && r.getTna().compareTo(BigDecimal.ZERO) > 0)
                    .map(this::mapFciToRateDTO)
                    .filter(dto -> !fciWalletNames.contains(dto.getName()))
                    .forEach(result::add);
        }

        for (Map.Entry<String, String> entry : FCI_TO_WALLET_MAPPING.entrySet()) {
            String fciName = entry.getKey();
            String walletName = entry.getValue();
            BigDecimal tna = fciTnas.get(fciName);

            if (tna != null && tna.compareTo(BigDecimal.ZERO) > 0) {
                result.add(createFciRateDTO(walletName, tna));
            }
        }

        result.sort((a, b) -> b.getTna().compareTo(a.getTna()));
        return markBestRate(result);
    }

    private RateDTO createFciRateDTO(String walletName, BigDecimal tnaDecimal) {
        BigDecimal teaPct = teaFromTna(tnaDecimal.divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP))
                .multiply(BigDecimal.valueOf(100));

        String logo = walletLogoUrl(walletName);

        return RateDTO.builder()
                .id(sanitizeId(walletName))
                .name(walletName.toUpperCase())
                .tna(tnaDecimal.setScale(1, RoundingMode.HALF_UP))
                .tea(teaPct.setScale(1, RoundingMode.HALF_UP))
                .product("Fondo Común de Inversión")
                .term(null)
                .date(null)
                .limit(null)
                .logo(logo)
                .link(null)
                .build();
    }

    @Cacheable(value = "rates", key = "'usdAccounts_' + #country + '_v3'")
    public List<RateDTO> getUsdAccountRates(Country country) {
        if (country != Country.ARGENTINA) {
            return List.of();
        }
        List<ArgentinaDatosClient.UsdAccountResponse> accounts = argentinaDatosClient.getUsdAccounts();
        List<ArgentinaDatosClient.YieldResponse> yields = argentinaDatosClient.getYields();

        java.util.List<RateDTO> result = new java.util.ArrayList<>();

        if (accounts != null) {
            accounts.stream()
                    .filter(r -> r.getEntity() != null && r.getTasa() != null && r.getTasa().compareTo(BigDecimal.ZERO) > 0)
                    .map(this::mapUsdAccountToRateDTO)
                    .forEach(result::add);
        }

        if (yields != null) {
            yields.stream()
                    .filter(r -> r.getEntity() != null && r.getRendimientos() != null)
                    .flatMap(r -> r.getRendimientos().stream()
                            .filter(detail -> "USD".equalsIgnoreCase(detail.getCurrency()))
                            .filter(detail -> detail.getApy() != null && detail.getApy().compareTo(BigDecimal.ZERO) > 0)
                            .map(detail -> mapYieldToRateDTO(r.getEntity(), detail)))
                    .forEach(result::add);
        }

        result.sort((a, b) -> b.getTna().compareTo(a.getTna()));
        return markBestRate(result);
    }

    @Cacheable(value = "rates", key = "'uvaMortgages_' + #country + '_v3'")
    public List<RateDTO> getUvaMortgageRates(Country country) {
        if (country != Country.ARGENTINA) {
            return List.of();
        }
        List<ArgentinaDatosClient.UvaMortgageResponse> mortgages = argentinaDatosClient.getUvaMortgages();
        if (mortgages == null) {
            return List.of();
        }
        List<RateDTO> sorted = mortgages.stream()
                .filter(r -> r.getCommercialName() != null && r.getTna() != null && r.getTna().compareTo(BigDecimal.ZERO) > 0)
                .map(this::mapUvaMortgageToRateDTO)
                .sorted(Comparator.comparing(RateDTO::getTna))
                .toList();
        if (!sorted.isEmpty()) {
            BigDecimal minTna = sorted.get(0).getTna();
            for (RateDTO rate : sorted) {
                rate.setIsBestRate(rate.getTna().compareTo(minTna) == 0);
            }
        }
        return sorted;
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
        if (fund == null || fund.isBlank()) {
            return "";
        }
        return fixMojibake(fund.trim()).toUpperCase();
    }

    private static String walletLogoUrl(String fund) {
        if (fund == null || fund.isBlank()) {
            return null;
        }
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
        if (baseName.isEmpty()) {
            return null;
        }
        return String.format(GOOGLE_FAVICON_API, baseName + ".com.ar");
    }

    private static String bankLogoUrl(String bankName) {
        if (bankName == null || bankName.isBlank()) {
            return null;
        }
        String upperName = bankName.toUpperCase().trim();
        for (Map.Entry<String, String> entry : BANK_DOMAINS.entrySet()) {
            if (upperName.contains(entry.getKey())) {
                return String.format(GOOGLE_FAVICON_API, entry.getValue());
            }
        }
        return null;
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

        if (cleaned.contains("NTANDER")) {
            cleaned = cleaned.replace("NTANDER", "SANTANDER");
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

        return result.toUpperCase().trim();
    }

    private static String extractFirstWords(String text, int maxWords, String prefix) {
        String[] words = text.split("\\s+");
        StringBuilder sb = new StringBuilder(prefix);
        int count = 0;
        for (String w : words) {
            if (w.isEmpty() || SKIP_WORDS.contains(w)) {
                continue;
            }
            if (count >= maxWords) {
                break;
            }
            if (sb.length() > prefix.length()) {
                sb.append(" ");
            }
            sb.append(w);
            count++;
        }
        return sb.toString();
    }

    private static String fixMojibake(String s) {
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

    private static String sanitizeId(String name) {
        if (name == null) {
            return UUID.randomUUID().toString();
        }
        return name.toLowerCase()
                .replaceAll("[^a-z0-9]", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_|_$", "");
    }

    private List<RateDTO> markBestRate(List<RateDTO> rates) {
        if (rates.isEmpty()) {
            return rates;
        }
        BigDecimal maxTna = rates.get(0).getTna();
        for (RateDTO rate : rates) {
            rate.setIsBestRate(rate.getTna().compareTo(maxTna) == 0);
        }
        return rates;
    }

    private RateDTO mapUsdAccountToRateDTO(ArgentinaDatosClient.UsdAccountResponse r) {
        BigDecimal tnaPct = r.getTasa().multiply(BigDecimal.valueOf(100));
        BigDecimal teaPct = teaFromTna(r.getTasa()).multiply(BigDecimal.valueOf(100));
        String entityName = formatFundName(r.getEntity());
        return RateDTO.builder()
                .id(sanitizeId(r.getEntity()))
                .name(entityName)
                .tna(tnaPct.setScale(1, RoundingMode.HALF_UP))
                .tea(teaPct.setScale(1, RoundingMode.HALF_UP))
                .product(null)
                .term(null)
                .date(null)
                .limit(r.getLimit())
                .logo(null)
                .link(null)
                .build();
    }

    private RateDTO mapYieldToRateDTO(String entity, ArgentinaDatosClient.YieldDetail detail) {
        BigDecimal apyDecimal = detail.getApy().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal tnaPct = detail.getApy();
        BigDecimal teaPct = teaFromTna(apyDecimal).multiply(BigDecimal.valueOf(100));
        String entityName = formatFundName(entity);
        return RateDTO.builder()
                .id(sanitizeId(entity + "_" + detail.getCurrency()))
                .name(entityName)
                .tna(tnaPct.setScale(1, RoundingMode.HALF_UP))
                .tea(teaPct.setScale(1, RoundingMode.HALF_UP))
                .product("Rendimiento en " + detail.getCurrency())
                .term(null)
                .date(detail.getDate())
                .limit(null)
                .logo(null)
                .link(null)
                .build();
    }

    private RateDTO mapUvaMortgageToRateDTO(ArgentinaDatosClient.UvaMortgageResponse r) {
        BigDecimal tnaPct = r.getTna().multiply(BigDecimal.valueOf(100));
        BigDecimal teaPct = teaFromTna(r.getTna()).multiply(BigDecimal.valueOf(100));
        String entityName = formatFundName(r.getCommercialName());
        String logo = bankLogoUrl(r.getCommercialName());
        return RateDTO.builder()
                .id(sanitizeId(r.getCommercialName()))
                .name(entityName)
                .tna(tnaPct.setScale(1, RoundingMode.HALF_UP))
                .tea(teaPct.setScale(1, RoundingMode.HALF_UP))
                .product("Crédito Hipotecario UVA")
                .term(null)
                .date(null)
                .limit(null)
                .logo(logo)
                .link(null)
                .build();
    }
}
