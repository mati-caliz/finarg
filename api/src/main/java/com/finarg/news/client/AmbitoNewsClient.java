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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Slf4j
@Component
public class AmbitoNewsClient implements NewsScraperClient {

    private final WebClient webClient;
    private static final String BASE_URL = "https://www.ambito.com";

    public AmbitoNewsClient(@Qualifier("ambitoWebClient") WebClient webClient) {
        this.webClient = webClient;
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
        } catch (Exception e) {
            log.error("Error fetching news from Ámbito: {}", e.getMessage());
            return List.of();
        }
    }

    private List<RawNewsDTO> parseHtml(String html) {
        List<RawNewsDTO> articles = new ArrayList<>();
        Document doc = Jsoup.parse(html);

        Elements articleElements = doc.select("article.article-item, article.news-item, div.article-container");

        for (Element article : articleElements.stream().limit(10).toList()) {
            try {
                String title = article.select("h2 a, h3 a, .article-title a").text();
                String url = article.select("h2 a, h3 a, .article-title a").attr("href");
                String summary = article.select(".article-summary, .article-description, p").first() != null
                        ? Objects.requireNonNull(article.select(".article-summary, .article-description, p").first()).text()
                        : "";
                String imageUrl = article.select("img").attr("src");

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
                        .source("Ámbito Financiero")
                        .imageUrl(imageUrl.isEmpty() ? null : imageUrl)
                        .publishedDate(LocalDateTime.now())
                        .isOfficial(false)
                        .build();

                articles.add(news);
            } catch (Exception e) {
                log.warn("Error parsing article from Ámbito: {}", e.getMessage());
            }
        }

        return articles;
    }

    @Override
    public String getSourceName() {
        return "Ámbito Financiero";
    }
}
