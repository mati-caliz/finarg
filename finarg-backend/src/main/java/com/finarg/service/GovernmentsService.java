package com.finarg.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finarg.model.dto.GovernmentDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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

            String encodedQuery = URLEncoder.encode(query.trim(), StandardCharsets.UTF_8);
            String responseBody = wikidataWebClient.get()
                    .uri("/sparql?query={query}&format=json", encodedQuery)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (responseBody == null || responseBody.isBlank()) {
                return List.of();
            }

            return parseSparqlResponse(responseBody);
        } catch (Exception e) {
            log.error("Error fetching governments from Wikidata for country {}: {}", country, e.getMessage());
            return List.of();
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

                if (label == null || start == null) continue;

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
        if (node.isMissingNode()) return null;
        JsonNode value = node.path("value");
        return value.isMissingNode() ? null : value.asText();
    }

    private String shortenLabel(String fullLabel) {
        if (fullLabel == null) return "?";
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
