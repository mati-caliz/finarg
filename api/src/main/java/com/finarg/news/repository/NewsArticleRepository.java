package com.finarg.news.repository;

import com.finarg.news.entity.NewsArticle;
import com.finarg.news.enums.NewsCategory;
import com.finarg.shared.enums.Country;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {

    Page<NewsArticle> findByCountryOrderByPublishedDateDesc(Country country, Pageable pageable);

    Page<NewsArticle> findByCountryAndCategoryOrderByPublishedDateDesc(
            Country country, NewsCategory category, Pageable pageable);

    boolean existsBySourceUrl(String sourceUrl);

    @Query("SELECT n FROM NewsArticle n WHERE n.isOfficial = true "
           + "AND n.country = :country ORDER BY n.publishedDate DESC")
    Page<NewsArticle> findOfficialBulletins(@Param("country") Country country, Pageable pageable);

}
