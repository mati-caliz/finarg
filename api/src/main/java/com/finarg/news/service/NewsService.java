package com.finarg.news.service;

import com.finarg.news.client.NewsScraperClient;
import com.finarg.news.client.OllamaClient;
import com.finarg.news.dto.AiAnalysisDTO;
import com.finarg.news.dto.NewsArticleResponseDTO;
import com.finarg.news.dto.NewsListResponseDTO;
import com.finarg.news.dto.RawNewsDTO;
import com.finarg.news.entity.NewsArticle;
import com.finarg.news.enums.NewsCategory;
import com.finarg.news.repository.NewsArticleRepository;
import com.finarg.shared.enums.Country;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    private final NewsArticleRepository newsArticleRepository;
    private final OllamaClient ollamaClient;
    private final List<NewsScraperClient> newsScraperClients;

    @Cacheable(value = "news", key = "'latest_' + #country.code + '_' + #page + '_' + #size")
    public NewsListResponseDTO getLatestNews(Country country, int page, int size) {
        log.info("Fetching latest news for country: {}, page: {}", country, page);
        Pageable pageable = PageRequest.of(page, size);
        Page<NewsArticle> newsPage = newsArticleRepository
                .findByCountryOrderByPublishedDateDesc(country, pageable);

        return buildNewsListResponse(newsPage);
    }

    @Cacheable(value = "news", key = "'category_' + #country.code + '_' + #category + '_' + #page")
    public NewsListResponseDTO getNewsByCategory(
            Country country, NewsCategory category, int page, int size) {
        log.info("Fetching news by category: {}, country: {}, page: {}", category, country, page);
        Pageable pageable = PageRequest.of(page, size);
        Page<NewsArticle> newsPage = newsArticleRepository
                .findByCountryAndCategoryOrderByPublishedDateDesc(country, category, pageable);

        return buildNewsListResponse(newsPage);
    }

    @Cacheable(value = "news", key = "'official_' + #country.code + '_' + #page")
    public NewsListResponseDTO getOfficialBulletins(Country country, int page, int size) {
        log.info("Fetching official bulletins for country: {}, page: {}", country, page);
        Pageable pageable = PageRequest.of(page, size);
        Page<NewsArticle> newsPage = newsArticleRepository
                .findOfficialBulletins(country, pageable);

        return buildNewsListResponse(newsPage);
    }

    public Optional<NewsArticleResponseDTO> getNewsById(Long id) {
        return newsArticleRepository.findById(id)
                .map(this::mapToResponseDTO);
    }

    @Transactional
    @CacheEvict(value = "news", allEntries = true)
    public void aggregateNews() {
        log.info("Starting news aggregation from {} sources", newsScraperClients.size());

        for (NewsScraperClient client : newsScraperClients) {
            try {
                log.info("Fetching news from: {}", client.getSourceName());
                List<RawNewsDTO> rawNews = client.fetchLatestNews();
                log.info("Fetched {} articles from {}", rawNews.size(), client.getSourceName());
                processRawNews(rawNews);
            } catch (Exception e) {
                log.error("Error aggregating news from {}: {}",
                    client.getSourceName(), e.getMessage());
            }
        }

        log.info("News aggregation completed");
    }

    private void processRawNews(List<RawNewsDTO> rawNewsList) {
        for (RawNewsDTO rawNews : rawNewsList) {
            if (newsArticleRepository.existsBySourceUrl(rawNews.getSourceUrl())) {
                log.debug("Article already exists: {}", rawNews.getTitle());
                continue;
            }

            try {
                log.debug("Analyzing article with AI: {}", rawNews.getTitle());
                AiAnalysisDTO analysis = ollamaClient.analyzeArticle(
                    rawNews.getTitle(),
                    rawNews.getContent()
                );

                NewsArticle article = NewsArticle.builder()
                        .title(rawNews.getTitle())
                        .content(rawNews.getContent())
                        .summary(rawNews.getContent())
                        .source(rawNews.getSource())
                        .sourceUrl(rawNews.getSourceUrl())
                        .imageUrl(rawNews.getImageUrl())
                        .publishedDate(rawNews.getPublishedDate())
                        .isOfficial(rawNews.getIsOfficial())
                        .country(Country.ARGENTINA)
                        .aiSummary(analysis.getSummary())
                        .sentiment(analysis.getSentiment())
                        .category(analysis.getCategory())
                        .keyPoints(String.join("; ", analysis.getKeyPoints()))
                        .build();

                newsArticleRepository.save(article);
                log.info("Saved news article: {} (Category: {}, Sentiment: {})",
                    article.getTitle(), article.getCategory(), article.getSentiment());
            } catch (Exception e) {
                log.error("Error processing news article '{}': {}",
                    rawNews.getTitle(), e.getMessage());
            }
        }
    }

    private NewsListResponseDTO buildNewsListResponse(Page<NewsArticle> newsPage) {
        List<NewsArticleResponseDTO> articles = newsPage.getContent().stream()
                .map(this::mapToResponseDTO)
                .toList();

        return NewsListResponseDTO.builder()
                .articles(articles)
                .totalPages(newsPage.getTotalPages())
                .totalElements(newsPage.getTotalElements())
                .currentPage(newsPage.getNumber())
                .pageSize(newsPage.getSize())
                .build();
    }

    private NewsArticleResponseDTO mapToResponseDTO(NewsArticle article) {
        List<String> keyPoints = article.getKeyPoints() != null
                ? Arrays.asList(article.getKeyPoints().split(";\\s*"))
                : List.of();

        return NewsArticleResponseDTO.builder()
                .id(article.getId())
                .title(article.getTitle())
                .summary(article.getSummary())
                .aiSummary(article.getAiSummary())
                .sentiment(article.getSentiment())
                .category(article.getCategory())
                .source(article.getSource())
                .sourceUrl(article.getSourceUrl())
                .imageUrl(article.getImageUrl())
                .isOfficial(article.getIsOfficial())
                .country(article.getCountry())
                .publishedDate(article.getPublishedDate())
                .keyPoints(keyPoints)
                .build();
    }
}
