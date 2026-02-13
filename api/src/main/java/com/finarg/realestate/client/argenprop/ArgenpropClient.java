package com.finarg.realestate.client.argenprop;

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
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Slf4j
@Component
public class ArgenpropClient implements PropertyClient {

    private final SeleniumScraperClient seleniumClient;
    private static final Set<String> SUPPORTED_CITIES = Set.of("caba");
    private static final String PORTAL_NAME = "argenprop";
    private static final String BASE_URL = "https://www.argenprop.com";

    public ArgenpropClient(SeleniumScraperClient seleniumClient) {
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
            log.warn("Argenprop not available for city: {}", cityCode);
            return List.of();
        }

        String relativeUrl = buildSearchUrl(neighborhoodCode, propertyType, operationType);
        String fullUrl = BASE_URL + relativeUrl;
        String html;

        log.info("Scraping Argenprop with Selenium: {}", fullUrl);
        if (!seleniumClient.isAvailable()) {
            log.error("Selenium not available for Argenprop scraping");
            return List.of();
        }

        try {
            html = seleniumClient.fetchPageSource(fullUrl);
        } catch (Exception e) {
            log.error("Error scraping Argenprop for {}: {}", neighborhoodCode, e.getMessage());
            return List.of();
        }

        if (html == null || html.isEmpty()) {
            log.warn("Empty response from Argenprop for {}", relativeUrl);
            return List.of();
        }

        try {
            List<ScrapedPropertyDTO> properties = parseHtml(html, neighborhoodCode, propertyType, operationType);
            log.info("Scraped {} properties from Argenprop for {}", properties.size(), neighborhoodCode);
            return properties;
        } catch (Exception e) {
            log.error("Error parsing Argenprop HTML for {}: {}", neighborhoodCode, e.getMessage());
            return List.of();
        }
    }

    private String buildSearchUrl(
            String neighborhoodCode,
            PropertyType propertyType,
            OperationType operationType) {

        StringBuilder url = new StringBuilder("/");

        if (propertyType != null) {
            url.append(mapPropertyType(propertyType)).append("s");
        } else {
            url.append("propiedades");
        }

        url.append("/");

        if (operationType == OperationType.SALE) {
            url.append("venta");
        } else {
            url.append("alquiler");
        }

        if (neighborhoodCode != null && !neighborhoodCode.isEmpty()) {
            url.append("/").append(neighborhoodCode);
        }

        return url.toString();
    }

    private List<ScrapedPropertyDTO> parseHtml(
            String html,
            String neighborhoodCode,
            PropertyType propertyType,
            OperationType operationType) {

        List<ScrapedPropertyDTO> properties = new ArrayList<>();

        try {
            Document doc = Jsoup.parse(html);

            log.debug("Trying multiple selectors for Argenprop listings...");
            Elements listingElements = doc.select("div.listing__item");
            log.debug("Selector 'div.listing__item' found {} elements", listingElements.size());

            if (listingElements.isEmpty()) {
                listingElements = doc.select(".listing__item");
                log.debug("Selector '.listing__item' found {} elements", listingElements.size());
            }

            if (listingElements.isEmpty()) {
                listingElements = doc.select("div[class*='listing__item']");
                log.debug("Selector 'div[class*=\"listing__item\"]' found {} elements", listingElements.size());
            }

            if (listingElements.isEmpty()) {
                listingElements = doc.select("div[class*='card__']");
                log.debug("Selector 'div[class*=\"card__\"]' found {} elements", listingElements.size());
            }

            if (listingElements.isEmpty()) {
                listingElements = doc.select("article");
                log.debug("Selector 'article' found {} elements", listingElements.size());
            }

            if (listingElements.isEmpty()) {
                log.warn("No listing elements found with any selector. HTML length: {}", html.length());
                log.debug("HTML contains 'propiedad': {}", html.contains("propiedad"));
                log.debug("HTML contains 'listing__item': {}", html.contains("listing__item"));
                log.debug("HTML contains 'card__': {}", html.contains("card__"));
            }

            for (Element listing : listingElements) {
                try {
                    ScrapedPropertyDTO property = extractPropertyFromElement(
                        listing,
                        neighborhoodCode,
                        propertyType,
                        operationType
                    );
                    if (property != null) {
                        properties.add(property);
                    }
                } catch (Exception e) {
                    log.debug("Error parsing individual listing: {}", e.getMessage());
                }
            }

        } catch (Exception e) {
            log.error("Error parsing Argenprop HTML: {}", e.getMessage());
        }

        return properties;
    }

    private ScrapedPropertyDTO extractPropertyFromElement(
            Element listing,
            String neighborhoodCode,
            PropertyType propertyType,
            OperationType operationType) {

        String externalId = extractExternalId(listing);

        String priceText = extractPriceText(listing);
        BigDecimal price = extractPrice(listing);
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        String currency = detectCurrency(priceText, price, operationType);
        BigDecimal surfaceM2 = extractSurface(listing);
        Integer bedrooms = extractBedrooms(listing);
        Integer bathrooms = extractBathrooms(listing);
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
            .currency(currency)
            .expenses(expenses)
            .condition(PropertyCondition.GOOD)
            .build();
    }

    private String extractExternalId(Element listing) {
        String dataId = listing.attr("data-item-id");
        if (!dataId.isEmpty()) {
            return dataId;
        }

        String href = listing.select("a[href]").attr("href");
        if (href.contains("/")) {
            String[] parts = href.split("/");
            for (String part : parts) {
                if (part.matches("\\d+")) {
                    return part;
                }
            }
        }

        return String.valueOf(listing.hashCode());
    }

    private BigDecimal extractPrice(Element listing) {
        try {
            Elements priceAmountElements = listing.select(".card__price-amount");
            if (!priceAmountElements.isEmpty()) {
                String priceText = Objects.requireNonNull(priceAmountElements.first()).text();
                log.debug("Found price-amount element: '{}'", priceText);

                String cleaned = priceText.replaceAll("[^0-9]", "");
                if (cleaned.length() >= 4) {
                    log.debug("Extracted price from price-amount: {}", cleaned);
                    return new BigDecimal(cleaned);
                }
            }

            Elements priceElements = listing.select(".card__price");
            for (Element priceEl : priceElements) {
                String fullText = priceEl.text();
                log.debug("Full price element text: '{}'", fullText);

                String priceText = fullText;
                if (fullText.contains("+")) {
                    priceText = fullText.split("\\+")[0];
                    log.debug("Text before '+': '{}'", priceText);
                } else if (fullText.toLowerCase().contains("expensas")) {
                    java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
                            "([\\d.]+).*expensas",
                        java.util.regex.Pattern.CASE_INSENSITIVE
                    );
                    java.util.regex.Matcher matcher = pattern.matcher(fullText);
                    if (matcher.find()) {
                        priceText = matcher.group(1);
                        log.debug("Text before 'expensas': '{}'", priceText);
                    }
                }

                String cleaned = priceText.replaceAll("[^0-9]", "");
                if (cleaned.length() >= 4) {
                    log.debug("Extracted price: {}", cleaned);
                    return new BigDecimal(cleaned);
                }
            }
        } catch (Exception e) {
            log.error("Error extracting price: {}", e.getMessage(), e);
        }
        return null;
    }

    private BigDecimal extractSurface(Element listing) {
        try {
            Elements mainFeatures = listing.select(".card__main-features li");
            log.debug("Found {} main feature items", mainFeatures.size());

            for (Element feature : mainFeatures) {
                String text = feature.text().toLowerCase();
                log.debug("Checking feature: '{}'", text);

                if (text.contains("m²") || text.contains("m2") || text.contains("cubie")) {
                    BigDecimal surface = extractSurfaceFromText(text);
                    if (surface != null) {
                        log.debug("Extracted surface: {}", surface);
                        return surface;
                    }
                }
            }

            Elements surfaceElements = listing.select(".surface, [class*='surface']");
            for (Element surfaceEl : surfaceElements) {
                String surfaceText = surfaceEl.text();
                if (surfaceText.contains("m")) {
                    BigDecimal surface = extractSurfaceFromText(surfaceText);
                    if (surface != null) {
                        log.debug("Extracted surface from fallback: {}", surface);
                        return surface;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error extracting surface: {}", e.getMessage(), e);
        }
        return null;
    }

    private BigDecimal extractSurfaceFromText(String text) {
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(\\d+)(?:,\\d+)?\\s*m[²2]?");
        java.util.regex.Matcher matcher = pattern.matcher(text.toLowerCase());
        if (matcher.find()) {
            String surfaceStr = matcher.group(1);
            try {
                return new BigDecimal(surfaceStr);
            } catch (NumberFormatException e) {
                log.debug("Error parsing surface: {}", surfaceStr);
            }
        }
        return null;
    }

    private Integer extractBedrooms(Element listing) {
        try {
            Elements mainFeatures = listing.select(".card__main-features");
            if (!mainFeatures.isEmpty()) {
                String text = Objects.requireNonNull(mainFeatures.first()).text().toLowerCase();
                if (text.contains("dormitorio") || text.contains("amb")) {
                    java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(\\d+)\\s*(amb|dormitorio)");
                    java.util.regex.Matcher matcher = pattern.matcher(text);
                    if (matcher.find()) {
                        return Integer.parseInt(matcher.group(1));
                    }
                }
            }

            Elements bedroomElements = listing.select("[class*='bedroom'], [class*='dormitorio']");
            for (Element bedroomEl : bedroomElements) {
                String text = bedroomEl.text().toLowerCase();
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(\\d+)");
                java.util.regex.Matcher matcher = pattern.matcher(text);
                if (matcher.find()) {
                    return Integer.parseInt(matcher.group(1));
                }
            }
        } catch (Exception e) {
            log.debug("Error extracting bedrooms: {}", e.getMessage());
        }
        return null;
    }

    private Integer extractBathrooms(Element listing) {
        try {
            Elements mainFeatures = listing.select(".card__main-features");
            if (!mainFeatures.isEmpty()) {
                String text = Objects.requireNonNull(mainFeatures.first()).text().toLowerCase();
                if (text.contains("baño")) {
                    java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(\\d+)\\s*baño");
                    java.util.regex.Matcher matcher = pattern.matcher(text);
                    if (matcher.find()) {
                        return Integer.parseInt(matcher.group(1));
                    }
                }
            }

            Elements bathroomElements = listing.select("[class*='bathroom'], [class*='baño']");
            for (Element bathroomEl : bathroomElements) {
                String text = bathroomEl.text().toLowerCase();
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(\\d+)");
                java.util.regex.Matcher matcher = pattern.matcher(text);
                if (matcher.find()) {
                    return Integer.parseInt(matcher.group(1));
                }
            }
        } catch (Exception e) {
            log.debug("Error extracting bathrooms: {}", e.getMessage());
        }
        return null;
    }

    private String extractAddress(Element listing) {
        Elements addressElements = listing.select(".card__address, .address, [class*='address']");
        if (!addressElements.isEmpty()) {
            return Objects.requireNonNull(addressElements.first()).text();
        }
        return null;
    }

    private BigDecimal extractExpenses(Element listing) {
        try {
            Elements expensesElements = listing.select(".card__expenses");
            for (Element expensesEl : expensesElements) {
                String text = expensesEl.text();
                String cleaned = text.replaceAll("[^0-9]", "");
                if (cleaned.length() >= 4) {
                    return new BigDecimal(cleaned);
                }
            }

            Elements priceElements = listing.select(".card__price");
            for (Element priceEl : priceElements) {
                String fullText = priceEl.text().toLowerCase();
                if (fullText.contains("expensas") || fullText.contains("exp.")) {
                    String[] parts = fullText.split("\\+");
                    if (parts.length > 1) {
                        String expText = parts[1];
                        String cleaned = expText.replaceAll("[^0-9]", "");
                        if (cleaned.length() >= 3) {
                            return new BigDecimal(cleaned);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Error extracting expenses: {}", e.getMessage());
        }
        return null;
    }

    private String extractPriceText(Element listing) {
        Elements priceElements = listing.select(".card__price, .card__price-amount");
        if (!priceElements.isEmpty()) {
            return Objects.requireNonNull(priceElements.first()).text();
        }
        return "";
    }

    private String detectCurrency(String priceText, BigDecimal price, OperationType operationType) {
        if (priceText == null || priceText.isEmpty()) {
            return operationType == OperationType.SALE ? "USD" : "ARS";
        }

        String lowerText = priceText.toLowerCase();

        if (lowerText.contains("us$") || lowerText.contains("usd") || lowerText.contains("u$s")) {
            return "USD";
        }

        if (lowerText.contains("$") || lowerText.contains("ars") || lowerText.contains("pesos")) {
            if (price.compareTo(new BigDecimal("500000")) > 0 && operationType == OperationType.RENT) {
                return "ARS";
            }
            if (lowerText.contains("ars") || lowerText.contains("pesos")) {
                return "ARS";
            }
        }

        if (operationType == OperationType.RENT && price.compareTo(new BigDecimal("10000")) > 0) {
            return "ARS";
        }

        return operationType == OperationType.SALE ? "USD" : "ARS";
    }

    private String mapPropertyType(PropertyType type) {
        return switch (type) {
            case APARTMENT -> "departamento";
            case HOUSE -> "casa";
            case PH -> "ph";
            case LAND -> "lote";
            case OFFICE -> "oficina";
            case COMMERCIAL -> "local";
        };
    }
}
