package com.finarg.news.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsListResponseDTO implements Serializable {
    private List<NewsArticleResponseDTO> articles;
    private int totalPages;
    private long totalElements;
    private int currentPage;
    private int pageSize;
}
