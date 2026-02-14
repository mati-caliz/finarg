package com.finarg.news.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RawNewsDTO {
    private String title;
    private String content;
    private String sourceUrl;
    private String source;
    private String imageUrl;
    private LocalDateTime publishedDate;
    private Boolean isOfficial;
}
