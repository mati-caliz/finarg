package com.finarg.news.client;

import com.finarg.news.dto.RawNewsDTO;

import java.util.List;

public interface NewsScraperClient {
    List<RawNewsDTO> fetchLatestNews();
    String getSourceName();
}
