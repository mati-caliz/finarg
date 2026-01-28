package com.finarg.repository;

import com.finarg.model.entity.QuoteHistory;
import com.finarg.model.enums.Country;
import com.finarg.model.enums.CurrencyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuoteHistoryRepository extends JpaRepository<QuoteHistory, Long> {
    
    List<QuoteHistory> findByTypeAndDateBetweenOrderByDateAsc(
            CurrencyType type, LocalDate startDate, LocalDate endDate);
    
    List<QuoteHistory> findByCountryAndTypeAndDateBetweenOrderByDateAsc(
            Country country, CurrencyType type, LocalDate startDate, LocalDate endDate);
    
    Optional<QuoteHistory> findByTypeAndDate(CurrencyType type, LocalDate date);
    
    @Query("SELECT q FROM QuoteHistory q WHERE q.type = :type ORDER BY q.date DESC LIMIT 1")
    Optional<QuoteHistory> findLatestByType(CurrencyType type);
    
    @Query("SELECT q FROM QuoteHistory q WHERE q.date = :date")
    List<QuoteHistory> findAllByDate(LocalDate date);
    
    @Query("SELECT q FROM QuoteHistory q WHERE q.country = :country AND q.date = :date")
    List<QuoteHistory> findAllByCountryAndDate(Country country, LocalDate date);
    
    boolean existsByTypeAndDate(CurrencyType type, LocalDate date);
    
    boolean existsByCountryAndTypeAndDate(Country country, CurrencyType type, LocalDate date);
}
