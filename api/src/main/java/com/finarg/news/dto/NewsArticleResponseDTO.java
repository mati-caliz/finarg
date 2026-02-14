package com.finarg.news.dto;

import com.finarg.news.enums.AiSentiment;
import com.finarg.news.enums.NewsCategory;
import com.finarg.shared.enums.Country;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsArticleResponseDTO implements Serializable {
    private Long id;
    private String title;
    private String summary;
    private String aiSummary;
    private AiSentiment sentiment;
    private NewsCategory category;
    private String source;
    private String sourceUrl;
    private String imageUrl;
    private Boolean isOfficial;
    private Country country;
    private LocalDateTime publishedDate;
    private List<String> keyPoints;
}
