package com.finarg.indicators.countryrisk.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finarg.indicators.countryrisk.dto.GovernmentDTO;
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
public class GovernmentsService {

    private static final Map<String, String> COUNTRY_TO_POSITION = Map.of(
            "ar", "Q12969145"
    );

    private static final String[] COLOR_PALETTE = {
            "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
            "#06b6d4", "#eab308", "#a855f7", "#6b7280", "#ec4899"
    };

    private final WebClient wikidataWebClient;
    private final ObjectMapper objectMapper;
    private final Map<String, List<GovernmentDTO>> cache = new ConcurrentHashMap<>();

    public GovernmentsService(@Qualifier("wikidataWebClient") WebClient wikidataWebClient, ObjectMapper objectMapper) {
        this.wikidataWebClient = wikidataWebClient;
        this.objectMapper = objectMapper;
    }

    public List<GovernmentDTO> getGovernments(String country) {
        return cache.computeIfAbsent(country, this::fetchFromWikidata);
    }

    private List<GovernmentDTO> fetchFromWikidata(String country) {
        String positionQid = COUNTRY_TO_POSITION.get(country.toLowerCase());
        if (positionQid == null) {
            return List.of();
        }

        try {
            String responseBody = wikidataWebClient.post()
                    .uri("/sparql")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .accept(MediaType.parseMediaType("application/sparql-results+json"))
                    .bodyValue(buildSparqlRequest(positionQid))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (responseBody == null || responseBody.isBlank()) {
                return getFallbackGovernments(country);
            }

            List<GovernmentDTO> parsed = parseSparqlResponse(responseBody);
            return parsed.isEmpty() ? getFallbackGovernments(country) : parsed;
        } catch (Exception e) {
            log.error("Error fetching governments from Wikidata for {}: {}", country, e.getMessage());
            return getFallbackGovernments(country);
        }
    }

    private MultiValueMap<String, String> buildSparqlRequest(String positionQid) {
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
        return formData;
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

                if (label == null || start == null) {
                    continue;
                }

                String end = getStringValue(binding, "end");
                String startDate = start.substring(0, Math.min(10, start.length()));
                String endDate = (end != null && end.length() >= 10) ? end.substring(0, 10) : "2099-12-31";

                result.add(GovernmentDTO.builder()
                        .startDate(startDate)
                        .endDate(endDate)
                        .label(cleanLabel(label))
                        .color(COLOR_PALETTE[colorIndex % COLOR_PALETTE.length])
                        .build());
                colorIndex++;
            }
        } catch (Exception e) {
            log.error("Error parsing Wikidata response: {}", e.getMessage());
        }
        return result;
    }

    private String cleanLabel(String label) {
        return label == null ? "?" : label.replaceAll("\\s*\\([^)]*\\)", "").trim();
    }

    private String getStringValue(JsonNode binding, String key) {
        return binding.has(key) && binding.get(key).has("value")
                ? binding.get(key).get("value").asText()
                : null;
    }

    private List<GovernmentDTO> getFallbackGovernments(String country) {
        if (!"ar".equalsIgnoreCase(country)) {
            return List.of();
        }

        return List.of(
                createGov("1989-07-08", "1999-12-10", "Menem", "#3b82f6"),
                createGov("1999-12-10", "2001-12-21", "De la Rúa", "#10b981"),
                createGov("2002-01-02", "2003-05-25", "Duhalde", "#f59e0b"),
                createGov("2003-05-25", "2007-12-10", "Kirchner", "#ef4444"),
                createGov("2007-12-10", "2015-12-10", "Fernández", "#8b5cf6"),
                createGov("2015-12-10", "2019-12-10", "Macri", "#06b6d4"),
                createGov("2019-12-10", "2023-12-10", "Fernández", "#a855f7"),
                createGov("2023-12-10", "2099-12-31", "Milei", "#6b7280")
        );
    }

    private GovernmentDTO createGov(String start, String end, String label, String color) {
        return GovernmentDTO.builder()
                .startDate(start)
                .endDate(end)
                .label(label)
                .color(color)
                .build();
    }
}
