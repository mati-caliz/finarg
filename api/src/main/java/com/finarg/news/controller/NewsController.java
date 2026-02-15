package com.finarg.news.controller;

import com.finarg.news.dto.NewsArticleResponseDTO;
import com.finarg.news.dto.NewsListResponseDTO;
import com.finarg.news.enums.NewsCategory;
import com.finarg.news.service.NewsService;
import com.finarg.shared.enums.Country;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;

@RestController
@Validated
@RequestMapping("/api/v1/news")
@RequiredArgsConstructor
@Tag(name = "News", description = "Financial news with AI analysis")
public class NewsController {

    private final NewsService newsService;

    @GetMapping
    @Operation(summary = "Get latest news paginated")
    public ResponseEntity<NewsListResponseDTO> getLatestNews(
            @RequestParam(defaultValue = "ar") String country,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Country countryEnum = Country.fromCode(country);
        return ResponseEntity.ok(newsService.getLatestNews(countryEnum, page, size));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get news by category")
    public ResponseEntity<NewsListResponseDTO> getNewsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "ar") String country,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Country countryEnum = Country.fromCode(country);
        NewsCategory categoryEnum = NewsCategory.valueOf(category.toUpperCase());
        return ResponseEntity.ok(newsService.getNewsByCategory(countryEnum, categoryEnum, page, size));
    }

    @GetMapping("/official")
    @Operation(summary = "Get official bulletins only")
    public ResponseEntity<NewsListResponseDTO> getOfficialBulletins(
            @RequestParam(defaultValue = "ar") String country,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Country countryEnum = Country.fromCode(country);
        return ResponseEntity.ok(newsService.getOfficialBulletins(countryEnum, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get news article by ID")
    public ResponseEntity<NewsArticleResponseDTO> getNewsById(@PathVariable Long id) {
        return newsService.getNewsById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/refresh")
    @Operation(summary = "Trigger news aggregation manually")
    public ResponseEntity<Void> refreshNews() {
        newsService.aggregateNews();
        return ResponseEntity.ok().build();
    }
}
