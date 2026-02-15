package com.finarg.holidays.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
public class ArgentinaHolidaysClient {

    private final WebClient webClient;

    public ArgentinaHolidaysClient(@Qualifier("argentinaHolidaysWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public List<HolidayApiResponse> getHolidaysByYear(int year) {
        try {
            log.info("Fetching holidays for year: {}", year);
            List<HolidayApiResponse> response = webClient.get()
                    .uri("/{year}", year)
                    .retrieve()
                    .bodyToFlux(HolidayApiResponse.class)
                    .collectList()
                    .block();

            log.info("Successfully fetched {} holidays for year {}", 
                    response != null ? response.size() : 0, year);
            return response != null ? response : List.of();
        } catch (Exception e) {
            log.error("Error fetching holidays for year {}: {}", year, e.getMessage());
            return List.of();
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record HolidayApiResponse(
            LocalDate fecha,
            String nombre,
            String tipo,
            Boolean nacional
    ) { }
}
