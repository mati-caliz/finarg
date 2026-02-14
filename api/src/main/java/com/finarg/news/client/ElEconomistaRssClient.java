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
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class ElEconomistaRssClient implements NewsScraperClient {

    private final WebClient webClient;
    private static final DateTimeFormatter RSS_DATE_FORMATTER = DateTimeFormatter.RFC_1123_DATE_TIME;

    public ElEconomistaRssClient(@Qualifier("eleconomistaWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    @Override
    public List<RawNewsDTO> fetchLatestNews() {
        try {
            String rssXml = webClient.get()
                    .uri("/feed/")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseRss(rssXml);
        } catch (WebClientResponseException e) {
            log.error("Error fetching RSS from El Economista (HTTP {}): {}", e.getStatusCode(), e.getMessage());
            return List.of();
        } catch (Exception e) {
            log.error("Error fetching RSS from El Economista: {}", e.getMessage());
            return List.of();
        }
    }

    private List<RawNewsDTO> parseRss(String rssXml) {
        List<RawNewsDTO> articles = new ArrayList<>();
        Document doc = Jsoup.parse(rssXml, "", org.jsoup.parser.Parser.xmlParser());

        Elements items = doc.select("item");

        for (Element item : items.stream().limit(10).toList()) {
            try {
                String title = getElementText(item, "title");
                String url = getElementText(item, "link");
                String description = getElementText(item, "description");
                String pubDateStr = getElementText(item, "pubDate");

                if (title.isEmpty() || url.isEmpty()) {
                    continue;
                }

                String cleanDescription = cleanHtmlFromDescription(description);
                String imageUrl = extractImageFromDescription(description);

                LocalDateTime publishedDate = parseRssDate(pubDateStr);

                RawNewsDTO news = RawNewsDTO.builder()
                        .title(title)
                        .content(cleanDescription.isEmpty() ? title : cleanDescription)
                        .sourceUrl(url)
                        .source("El Economista")
                        .imageUrl(imageUrl)
                        .publishedDate(publishedDate)
                        .isOfficial(false)
                        .build();

                articles.add(news);
            } catch (Exception e) {
                log.warn("Error parsing RSS item from El Economista: {}", e.getMessage());
            }
        }

        return articles;
    }

    private String getElementText(Element parent, String selector) {
        Element element = parent.selectFirst(selector);
        return element != null ? element.text() : "";
    }

    private String cleanHtmlFromDescription(String description) {
        if (description == null || description.isEmpty()) {
            return "";
        }
        Document doc = Jsoup.parse(description);
        return doc.text();
    }

    private String extractImageFromDescription(String description) {
        if (description == null || description.isEmpty()) {
            return null;
        }
        Document doc = Jsoup.parse(description);
        Element img = doc.selectFirst("img");
        return img != null ? img.attr("src") : null;
    }

    private LocalDateTime parseRssDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) {
            return LocalDateTime.now();
        }

        try {
            ZonedDateTime zonedDateTime = ZonedDateTime.parse(dateStr, RSS_DATE_FORMATTER);
            return zonedDateTime.toLocalDateTime();
        } catch (DateTimeParseException e) {
            log.debug("Could not parse RSS date: {}, using current time", dateStr);
            return LocalDateTime.now();
        }
    }

    @Override
    public String getSourceName() {
        return "El Economista";
    }
}
