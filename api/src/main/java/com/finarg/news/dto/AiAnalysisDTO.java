package com.finarg.news.dto;

import com.finarg.news.enums.AiSentiment;
import com.finarg.news.enums.NewsCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisDTO {
    private String summary;
    private AiSentiment sentiment;
    private NewsCategory category;
    private List<String> keyPoints;
}
