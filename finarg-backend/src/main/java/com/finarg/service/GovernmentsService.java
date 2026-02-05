package com.finarg.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finarg.model.dto.GovernmentDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class GovernmentsService {

    private static final Map<String, String> COUNTRY_TO_POSITION = Map.of(
            "ar", "Q12969145"
    );

    private static final String[] COLOR_PALETTE = {
            "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
            "#06b6d4", "#eab308", "#a855f7", "#6b7280", "#ec4899"
    };

    @Qualifier("wikidataWebClient")
    private final WebClient wikidataWebClient;
    private final ObjectMapper objectMapper;

    private final ConcurrentHashMap<String, List<GovernmentDTO>> cache = new ConcurrentHashMap<>();

    public List<GovernmentDTO> getGovernments(String country) {
        return cache.computeIfAbsent(country, this::fetchFromWikidata);
    }

    private List<GovernmentDTO> fetchFromWikidata(String country) {
        String positionQid = COUNTRY_TO_POSITION.get(country.toLowerCase());
        if (positionQid == null) {
            log.warn("No Wikidata position configured for country: {}", country);
            return List.of();
        }

        try {
            String query = """
                SELECT ?item ?itemLabel ?start ?end WHERE {
                  ?item p:P39 ?stmt .
                  ?stmt ps:P39 wd:%s .
                  ?stmt pq:P580 ?start .
                  OPTIONAL { ?stmt pq:P582 ?end . }
                  SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
                }
                ORDER BY ASC(?start)
                """.formatted(positionQid);

            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("query", query.trim());
            formData.add("format", "json");

            String responseBody = wikidataWebClient.post()
                    .uri("/sparql")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .accept(MediaType.parseMediaType("application/sparql-results+json"))
                    .bodyValue(formData)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (responseBody == null || responseBody.isBlank()) {
                return getFallbackGovernments(country);
            }

            List<GovernmentDTO> parsed = parseSparqlResponse(responseBody);
            return parsed.isEmpty() ? getFallbackGovernments(country) : parsed;
        } catch (Exception e) {
            log.error("Error fetching governments from Wikidata for country {}: {}", country, e.getMessage());
            return getFallbackGovernments(country);
        }
    }

    private List<GovernmentDTO> parseSparqlResponse(String json) {
        List<GovernmentDTO> result = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode bindings = root.path("results").path("bindings");
            if (!bindings.isArray()) {
                return List.of();
            }

            int colorIndex = 0;
            for (JsonNode binding : bindings) {
                String label = getStringValue(binding, "itemLabel");
                String start = getStringValue(binding, "start");
                String end = getStringValue(binding, "end");

                if (label == null || start == null) {
                    continue;
                }

                String startDate = start.substring(0, Math.min(10, start.length()));
                String endDate = end != null && end.length() >= 10
                        ? end.substring(0, 10)
                        : "2099-12-31";

                String shortLabel = shortenLabel(label);
                String color = COLOR_PALETTE[colorIndex % COLOR_PALETTE.length];

                result.add(GovernmentDTO.builder()
                        .startDate(startDate)
                        .endDate(endDate)
                        .label(shortLabel)
                        .color(color)
                        .build());
                colorIndex++;
            }

            log.info("Fetched {} governments from Wikidata", result.size());
        } catch (Exception e) {
            log.error("Error parsing Wikidata SPARQL response: {}", e.getMessage());
        }
        return result;
    }

    private String getStringValue(JsonNode binding, String key) {
        JsonNode node = binding.path(key);
        if (node.isMissingNode()) {
            return null;
        }
        JsonNode value = node.path("value");
        return value.isMissingNode() ? null : value.asText();
    }

    private List<GovernmentDTO> getFallbackGovernments(String country) {
        if (!"ar".equalsIgnoreCase(country)) {
            return List.of();
        }
        return List.of(
                GovernmentDTO.builder().startDate("1989-07-08").endDate("1999-12-10").label("Menem").color("#3b82f6").build(),
                GovernmentDTO.builder().startDate("1999-12-10").endDate("2001-12-21").label("De la Rúa").color("#10b981").build(),
                GovernmentDTO.builder().startDate("2002-01-02").endDate("2003-05-25").label("Duhalde").color("#f59e0b").build(),
                GovernmentDTO.builder().startDate("2003-05-25").endDate("2007-12-10").label("Kirchner").color("#ef4444").build(),
                GovernmentDTO.builder().startDate("2007-12-10").endDate("2015-12-10").label("Fernández").color("#8b5cf6").build(),
                GovernmentDTO.builder().startDate("2015-12-10").endDate("2019-12-10").label("Macri").color("#06b6d4").build(),
                GovernmentDTO.builder().startDate("2019-12-10").endDate("2023-12-10").label("Fernández").color("#a855f7").build(),
                GovernmentDTO.builder().startDate("2023-12-10").endDate("2099-12-31").label("Milei").color("#6b7280").build()
        );
    }

    private String shortenLabel(String fullLabel) {
        if (fullLabel == null) {
            return "?";
        }
        return fullLabel
                .replace(" (Presidente de Argentina)", "")
                .replace(" (President of Argentina)", "")
                .replace(" (político)", "")
                .replace(" (militar)", "")
                .replace(" (abogado)", "")
                .replace(" (lawyer)", "")
                .replace(" (politician)", "")
                .replace(" (military personnel)", "")
                .trim();
    }
}
