package com.finarg.news.entity;

import com.finarg.news.enums.AiSentiment;
import com.finarg.news.enums.NewsCategory;
import com.finarg.shared.enums.Country;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "news_articles", indexes = {
    @Index(name = "idx_news_published_date", columnList = "publishedDate DESC"),
    @Index(name = "idx_news_source_date", columnList = "source, publishedDate DESC"),
    @Index(name = "idx_news_category", columnList = "category"),
    @Index(name = "idx_news_country", columnList = "country")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 1000)
    private String summary;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false, unique = true, length = 2048)
    private String sourceUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Country country = Country.ARGENTINA;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NewsCategory category;

    @Column(nullable = false)
    private LocalDateTime publishedDate;

    @Column(length = 1000)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    @Enumerated(EnumType.STRING)
    private AiSentiment sentiment;

    @Column(columnDefinition = "TEXT")
    private String keyPoints;

    @Column
    private Boolean isOfficial;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isOfficial == null) {
            isOfficial = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
