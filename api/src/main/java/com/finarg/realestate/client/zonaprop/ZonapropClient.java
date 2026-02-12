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
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Slf4j
@Component
public class ZonapropClient implements PropertyClient {

    private final WebClient webClient;
    private final SeleniumScraperClient seleniumClient;
    private static final Set<String> SUPPORTED_CITIES = Set.of("caba");
    private static final String PORTAL_NAME = "zonaprop";
    private static final String BASE_URL = "https://www.zonaprop.com.ar";

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
            log.info("Scraping Zonaprop with WebClient: {}", relativeUrl);
            html = webClient.get()
                .uri(relativeUrl)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        } catch (WebClientResponseException.Forbidden e) {
            log.warn("WebClient blocked by Cloudflare (403), trying with Selenium: {}", relativeUrl);
            if (seleniumClient.isAvailable()) {
                html = seleniumClient.fetchPageSource(fullUrl);
            } else {
                log.error("Selenium not available, cannot bypass Cloudflare");
                return List.of();
            }
        } catch (Exception e) {
            log.error("Error with WebClient for {}: {}", neighborhoodCode, e.getMessage());
            if (seleniumClient.isAvailable()) {
                log.info("Retrying with Selenium...");
                html = seleniumClient.fetchPageSource(fullUrl);
            } else {
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

        url.append("-");

        if (operationType == OperationType.SALE) {
            url.append("venta");
        } else {
            url.append("alquiler");
        }

        if (neighborhoodCode != null && !neighborhoodCode.isEmpty()) {
            url.append("-").append(neighborhoodCode);
        }

        url.append(".html");

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

            log.debug("Trying multiple selectors for Zonaprop listings...");
            Elements listingElements = doc.select("div[data-id]");
            log.debug("Selector 'div[data-id]' found {} elements", listingElements.size());

            if (listingElements.isEmpty()) {
                listingElements = doc.select("div.postingCard");
                log.debug("Selector 'div.postingCard' found {} elements", listingElements.size());
            }

            if (listingElements.isEmpty()) {
                listingElements = doc.select("div[data-posting-id]");
                log.debug("Selector 'div[data-posting-id]' found {} elements", listingElements.size());
            }

            if (listingElements.isEmpty()) {
                listingElements = doc.select("article");
                log.debug("Selector 'article' found {} elements", listingElements.size());
            }

            if (listingElements.isEmpty()) {
                log.warn("No listing elements found with any selector. HTML length: {}", html.length());
                log.debug("HTML contains 'propiedad': {}", html.contains("propiedad"));
                log.debug("HTML contains 'listing': {}", html.contains("listing"));
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
            log.error("Error parsing Zonaprop HTML: {}", e.getMessage());
        }

        return properties;
    }

    private ScrapedPropertyDTO extractPropertyFromElement(
            Element listing,
            String neighborhoodCode,
            PropertyType propertyType,
            OperationType operationType) {

        String externalId = extractExternalId(listing);
        if (externalId == null) {
            return null;
        }

        BigDecimal price = extractPrice(listing);
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

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
            .currency("USD")
            .expenses(expenses)
            .condition(PropertyCondition.GOOD)
            .build();
    }

    private String extractExternalId(Element listing) {
        String dataId = listing.attr("data-id");
        if (!dataId.isEmpty()) {
            return dataId;
        }

        String href = listing.select("a[href]").attr("href");
        if (href.contains("-")) {
            String[] parts = href.split("-");
            return parts[parts.length - 1].replaceAll("[^0-9]", "");
        }

        return null;
    }

    private BigDecimal extractPrice(Element listing) {
        try {
            Elements priceElements = listing.select(".price, .postingCardPrice, [class*='price']");
            for (Element priceEl : priceElements) {
                String priceText = priceEl.text();
                if (!priceText.isEmpty()) {
                    String cleaned = priceText.replaceAll("[^0-9]", "");
                    if (!cleaned.isEmpty()) {
                        return new BigDecimal(cleaned);
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Error extracting price: {}", e.getMessage());
        }
        return null;
    }

    private BigDecimal extractSurface(Element listing) {
        try {
            Elements surfaceElements = listing.select(".surface, [class*='surface'], [class*='superficie']");
            for (Element surfaceEl : surfaceElements) {
                String surfaceText = surfaceEl.text();
                if (surfaceText.contains("m")) {
                    String cleaned = surfaceText.replaceAll("[^0-9.]", "");
                    if (!cleaned.isEmpty()) {
                        return new BigDecimal(cleaned);
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Error extracting surface: {}", e.getMessage());
        }
        return null;
    }

    private Integer extractBedrooms(Element listing) {
        try {
            Elements bedroomElements = listing.select(".bedrooms, [class*='bedroom'], [class*='dormitorio']");
            for (Element bedroomEl : bedroomElements) {
                String text = bedroomEl.text();
                String cleaned = text.replaceAll("[^0-9]", "");
                if (!cleaned.isEmpty()) {
                    return Integer.parseInt(cleaned);
                }
            }
        } catch (Exception e) {
            log.debug("Error extracting bedrooms: {}", e.getMessage());
        }
        return null;
    }

    private Integer extractBathrooms(Element listing) {
        try {
            Elements bathroomElements = listing.select(".bathrooms, [class*='bathroom'], [class*='baño']");
            for (Element bathroomEl : bathroomElements) {
                String text = bathroomEl.text();
                String cleaned = text.replaceAll("[^0-9]", "");
                if (!cleaned.isEmpty()) {
                    return Integer.parseInt(cleaned);
                }
            }
        } catch (Exception e) {
            log.debug("Error extracting bathrooms: {}", e.getMessage());
        }
        return null;
    }

    private String extractAddress(Element listing) {
        Elements addressElements = listing.select(".address, [class*='address'], [class*='ubicacion']");
        if (!addressElements.isEmpty()) {
            return Objects.requireNonNull(addressElements.first()).text();
        }
        return null;
    }

    private BigDecimal extractExpenses(Element listing) {
        try {
            Elements expensesElements = listing.select(".expenses, [class*='expenses'], [class*='expensas']");
            for (Element expensesEl : expensesElements) {
                String text = expensesEl.text();
                String cleaned = text.replaceAll("[^0-9]", "");
                if (!cleaned.isEmpty()) {
                    return new BigDecimal(cleaned);
                }
            }
        } catch (Exception e) {
            log.debug("Error extracting expenses: {}", e.getMessage());
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
