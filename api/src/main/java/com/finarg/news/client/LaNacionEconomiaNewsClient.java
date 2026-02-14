package com.finarg.news.client;

import com.finarg.news.dto.RawNewsDTO;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.netty.http.client.HttpClient;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class LaNacionEconomiaNewsClient implements NewsScraperClient {

    private final WebClient webClient;
    private static final String BASE_URL = "https://www.lanacion.com.ar";
    private static final int MAX_IN_MEMORY_SIZE = 10 * 1024 * 1024;

    public LaNacionEconomiaNewsClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(10000))
                .followRedirect(true);

        this.webClient = WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(BASE_URL)
                .defaultHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .defaultHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(MAX_IN_MEMORY_SIZE))
                .build();
    }

    @Override
    public List<RawNewsDTO> fetchLatestNews() {
        try {
            String html = webClient.get()
                    .uri("/economia")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseHtml(html);
        } catch (WebClientResponseException e) {
            log.error("Error fetching news from La Nación (HTTP {}): {}", e.getStatusCode(), e.getMessage());
            return List.of();
        } catch (Exception e) {
            log.error("Error fetching news from La Nación: {}", e.getMessage());
            return List.of();
        }
    }

    private List<RawNewsDTO> parseHtml(String html) {
        List<RawNewsDTO> articles = new ArrayList<>();
        Document doc = Jsoup.parse(html);

        Elements articleElements = doc.select("article, div.card-nota, div.nota");

        for (Element article : articleElements.stream().limit(10).toList()) {
            try {
                Element titleElement = article.selectFirst("h2 a, h3 a, h4 a, a.nota-titulo");
                if (titleElement == null) {
                    continue;
                }

                String title = titleElement.text();
                String url = titleElement.attr("href");

                Element summaryElement = article.selectFirst("p, div.bajada, div.descripcion");
                String summary = summaryElement != null ? summaryElement.text() : "";

                Element imageElement = article.selectFirst("img");
                String imageUrl = imageElement != null ? imageElement.attr("data-src") : null;
                if (imageUrl == null || imageUrl.isEmpty()) {
                    imageUrl = imageElement != null ? imageElement.attr("src") : null;
                }

                if (title.isEmpty() || url.isEmpty()) {
                    continue;
                }

                if (!url.startsWith("http")) {
                    url = BASE_URL + url;
                }

                RawNewsDTO news = RawNewsDTO.builder()
                        .title(title)
                        .content(summary.isEmpty() ? title : summary)
                        .sourceUrl(url)
                        .source("La Nación")
                        .imageUrl(imageUrl != null && !imageUrl.isEmpty() ? imageUrl : null)
                        .publishedDate(LocalDateTime.now())
                        .isOfficial(false)
                        .build();

                articles.add(news);
            } catch (Exception e) {
                log.warn("Error parsing article from La Nación: {}", e.getMessage());
            }
        }

        return articles;
    }

    @Override
    public String getSourceName() {
        return "La Nación";
    }
}
