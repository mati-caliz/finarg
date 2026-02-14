package com.finarg.news.client;

import com.finarg.news.dto.RawNewsDTO;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Slf4j
@Component
public class BcraNewsClient implements NewsScraperClient {

    private final WebClient webClient;
    private static final String BASE_URL = "https://www.bcra.gob.ar";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.forLanguageTag("es-AR"));

    public BcraNewsClient(@Qualifier("bcraWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    @Override
    public List<RawNewsDTO> fetchLatestNews() {
        try {
            String html = webClient.get()
                    .uri("/politica-monetaria/")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseHtml(html);
        } catch (WebClientResponseException e) {
            log.error("Error fetching BCRA bulletins (HTTP {}): {}", e.getStatusCode(), e.getMessage());
            return List.of();
        } catch (Exception e) {
            log.error("Error fetching BCRA bulletins: {}", e.getMessage());
            return List.of();
        }
    }

    private List<RawNewsDTO> parseHtml(String html) {
        List<RawNewsDTO> articles = new ArrayList<>();
        Document doc = Jsoup.parse(html);

        Elements bulletinElements = doc.select("div.comunicacion, tr.comunicacion, div.item-comunicacion");

        if (bulletinElements.isEmpty()) {
            bulletinElements = doc.select("table tr");
        }

        for (Element bulletin : bulletinElements.stream().limit(5).toList()) {
            try {
                Element linkElement = bulletin.selectFirst("a");
                if (linkElement == null) {
                    continue;
                }

                String title = linkElement.text();
                String url = linkElement.attr("href");

                if (title.isEmpty() || url.isEmpty()) {
                    continue;
                }

                if (!url.startsWith("http")) {
                    url = BASE_URL + (url.startsWith("/") ? url : "/" + url);
                }

                Elements dateElements = bulletin.select("td, span.fecha, div.fecha");
                LocalDateTime publishedDate = LocalDateTime.now();

                for (Element dateElement : dateElements) {
                    String dateText = dateElement.text().trim();
                    if (dateText.matches("\\d{2}/\\d{2}/\\d{4}")) {
                        try {
                            publishedDate = DATE_FORMATTER.parse(dateText, LocalDateTime::from);
                            break;
                        } catch (DateTimeParseException e) {
                            log.debug("Could not parse date: {}", dateText);
                        }
                    }
                }

                Element summaryElement = bulletin.selectFirst("p, div.resumen");
                String summary = summaryElement != null ? summaryElement.text() : title;

                RawNewsDTO news = RawNewsDTO.builder()
                        .title(title)
                        .content(summary)
                        .sourceUrl(url)
                        .source("BCRA")
                        .imageUrl(null)
                        .publishedDate(publishedDate)
                        .isOfficial(true)
                        .build();

                articles.add(news);
            } catch (Exception e) {
                log.warn("Error parsing BCRA bulletin: {}", e.getMessage());
            }
        }

        return articles;
    }

    @Override
    public String getSourceName() {
        return "BCRA";
    }
}
