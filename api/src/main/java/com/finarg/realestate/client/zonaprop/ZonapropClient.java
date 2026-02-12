package com.finarg.realestate.client.zonaprop;

import com.finarg.realestate.client.PropertyClient;
import com.finarg.realestate.client.selenium.SeleniumScraperClient;
import com.finarg.realestate.dto.ScrapedPropertyDTO;
import com.finarg.realestate.enums.OperationType;
import com.finarg.realestate.enums.PropertyCondition;
import com.finarg.realestate.enums.PropertyType;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Set;

@Slf4j
@Component
public class ZonapropClient implements PropertyClient {

    private final WebClient webClient;
    private final SeleniumScraperClient seleniumClient;
    private final Random random = new Random();
    private static final Set<String> SUPPORTED_CITIES = Set.of("caba");
    private static final String PORTAL_NAME = "zonaprop";
    private static final String BASE_URL = "https://www.zonaprop.com.ar";
    private static final int MIN_DELAY_MS = 5000;
    private static final int MAX_DELAY_MS = 10000;

    public ZonapropClient(
            @Qualifier("zonapropWebClient") WebClient webClient,
            SeleniumScraperClient seleniumClient) {
        this.webClient = webClient;
        this.seleniumClient = seleniumClient;
    }

    @Override
    public String getPortalName() {
        return PORTAL_NAME;
    }

    @Override
    public boolean isAvailableForCity(String cityCode) {
        return SUPPORTED_CITIES.contains(cityCode.toLowerCase());
    }

    @Override
    public List<ScrapedPropertyDTO> scrapeProperties(
            String cityCode,
            String neighborhoodCode,
            PropertyType propertyType,
            OperationType operationType) {

        if (!isAvailableForCity(cityCode)) {
            log.warn("Zonaprop not available for city: {}", cityCode);
            return List.of();
        }

        String relativeUrl = buildSearchUrl(neighborhoodCode, propertyType, operationType);
        String fullUrl = BASE_URL + relativeUrl;
        String html;

        try {
            int delay = MIN_DELAY_MS + random.nextInt(MAX_DELAY_MS - MIN_DELAY_MS);
            log.debug("Waiting {} ms before scraping Zonaprop", delay);
            Thread.sleep(delay);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        if (seleniumClient.isAvailable()) {
            log.info("Scraping Zonaprop with Selenium (Primary): {}", relativeUrl);
            html = seleniumClient.fetchPageSource(fullUrl);
        } else {
            try {
                log.info("Scraping Zonaprop with WebClient (Fallback): {}", relativeUrl);
                html = webClient.get()
                        .uri(relativeUrl)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();
            } catch (Exception e) {
                log.error("WebClient failed: {}", e.getMessage());
                return List.of();
            }
        }

        if (html == null || html.isEmpty()) {
            log.warn("Empty response from Zonaprop for {}", relativeUrl);
            return List.of();
        }

        try {
            List<ScrapedPropertyDTO> properties = parseHtml(html, neighborhoodCode, propertyType, operationType);
            log.info("Scraped {} properties from Zonaprop for {}", properties.size(), neighborhoodCode);
            return properties;
        } catch (Exception e) {
            log.error("Error parsing Zonaprop HTML for {}: {}", neighborhoodCode, e.getMessage());
            return List.of();
        }
    }

    private String buildSearchUrl(String neighborhoodCode, PropertyType propertyType, OperationType operationType) {
        StringBuilder url = new StringBuilder("/");
        if (propertyType != null) {
            url.append(mapPropertyType(propertyType)).append("s");
        } else {
            url.append("propiedades");
        }
        url.append("-");
        url.append(operationType == OperationType.SALE ? "venta" : "alquiler");
        if (neighborhoodCode != null && !neighborhoodCode.isEmpty()) {
            url.append("-").append(neighborhoodCode);
        }
        url.append(".html");
        return url.toString();
    }

    private List<ScrapedPropertyDTO> parseHtml(
            String html, String neighborhoodCode, PropertyType propertyType, OperationType operationType) {
        List<ScrapedPropertyDTO> properties = new ArrayList<>();
        Document doc = Jsoup.parse(html);

        // --- SELECTORES ACTUALIZADOS 2024 ---
        // ZonaProp ahora usa data-qa="posting PROPERTY"
        Elements listingElements = doc.select("div[data-qa='posting PROPERTY']");

        // Fallback para listings destacados que a veces tienen otra estructura
        if (listingElements.isEmpty()) {
            listingElements = doc.select("div[data-qa='ad-card']");
        }

        // Fallback legacy (por si acaso)
        if (listingElements.isEmpty()) {
            listingElements = doc.select("div.postingCard");
        }

        log.debug("Found {} elements using current selectors", listingElements.size());

        for (Element listing : listingElements) {
            try {
                ScrapedPropertyDTO property = extractPropertyFromElement(listing, neighborhoodCode, propertyType, operationType);
                if (property != null) {
                    properties.add(property);
                }
            } catch (Exception e) {
                // Ignorar errores individuales
            }
        }
        return properties;
    }

    private ScrapedPropertyDTO extractPropertyFromElement(
            Element listing, String neighborhoodCode, PropertyType propertyType, OperationType operationType) {
        String externalId = extractExternalId(listing);
        if (externalId == null) {
            return null;
        }

        BigDecimal price = extractPrice(listing);
        if (price == null) {
            return null;
        }

        BigDecimal surfaceM2 = extractSurface(listing);
        Integer bedrooms = extractFeature(listing, "dorm"); // Busca texto "2 dorm."
        Integer bathrooms = extractFeature(listing, "baño"); // Busca texto "1 baño"
        String address = extractAddress(listing);
        BigDecimal expenses = extractExpenses(listing);

        return ScrapedPropertyDTO.builder()
                .externalId(externalId)
                .portalSource(PORTAL_NAME)
                .propertyType(propertyType)
                .operationType(operationType)
                .neighborhoodCode(neighborhoodCode)
                .address(address)
                .surfaceM2(surfaceM2)
                .coveredSurfaceM2(surfaceM2)
                .bedrooms(bedrooms)
                .bathrooms(bathrooms)
                .price(price)
                .currency("USD") // Asumimos USD para venta, habría que detectar símbolo
                .expenses(expenses)
                .condition(PropertyCondition.GOOD)
                .build();
    }

    private String extractExternalId(Element listing) {
        // ID suele estar en data-id o data-to-posting
        String dataId = listing.attr("data-id");
        if (!dataId.isEmpty()) {
            return dataId;
        }

        dataId = listing.attr("data-to-posting");
        if (!dataId.isEmpty()) {
            return dataId;
        }

        return null;
    }

    private BigDecimal extractPrice(Element listing) {
        Element priceEl = listing.selectFirst("[data-qa='POSTING_CARD_PRICE']");
        String text = (priceEl != null) ? priceEl.text() : listing.select(".price").text();

        if (text.isEmpty()) {
            return null;
        }

        String cleaned = text.replaceAll("[^0-9]", "");
        return cleaned.isEmpty() ? null : new BigDecimal(cleaned);
    }

    private String extractAddress(Element listing) {
        Element addrEl = listing.selectFirst("[data-qa='POSTING_CARD_LOCATION']");
        return (addrEl != null) ? addrEl.text() : listing.select(".address").text();
    }

    private BigDecimal extractSurface(Element listing) {
        // Selector moderno: data-qa="POSTING_CARD_FEATURES"
        // Busca dentro de las características
        Elements features = listing.select("[data-qa='POSTING_CARD_FEATURES'] span");
        if (features.isEmpty()) {
            features = listing.select("ul.mainFeatures li");
        }

        for (Element f : features) {
            String txt = f.text().toLowerCase();
            if (txt.contains("m²") || txt.contains("m2")) {
                // "50 m² tot." -> "50"
                String nums = txt.split(" ")[0].replaceAll("[^0-9]", "");
                if (!nums.isEmpty()) {
                    return new BigDecimal(nums);
                }
            }
        }
        return null;
    }

    private Integer extractFeature(Element listing, String keyword) {
        Elements features = listing.select("[data-qa='POSTING_CARD_FEATURES'] span");
        if (features.isEmpty()) {
            features = listing.select("ul.mainFeatures li");
        }

        for (Element f : features) {
            String txt = f.text().toLowerCase();
            if (txt.contains(keyword)) {
                String nums = txt.replaceAll("[^0-9]", "");
                if (!nums.isEmpty()) {
                    return Integer.parseInt(nums);
                }
            }
        }
        return null;
    }

    private BigDecimal extractExpenses(Element listing) {
        Element expEl = listing.selectFirst("[data-qa='POSTING_CARD_EXPENSES']");
        String text = (expEl != null) ? expEl.text() : listing.select(".expenses").text();

        if (!text.isEmpty()) {
            String cleaned = text.replaceAll("[^0-9]", "");
            if (!cleaned.isEmpty()) {
                return new BigDecimal(cleaned);
            }
        }
        return null;
    }

    private String mapPropertyType(PropertyType type) {
        return switch (type) {
            case APARTMENT -> "departamento";
            case HOUSE -> "casa";
            case PH -> "ph";
            case LAND -> "terreno";
            case OFFICE -> "oficina";
            case COMMERCIAL -> "local";
        };
    }
}
