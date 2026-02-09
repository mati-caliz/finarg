package com.finarg.repository;

import com.finarg.model.entity.QuoteHistory;
import com.finarg.model.enums.CurrencyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuoteHistoryRepository extends JpaRepository<QuoteHistory, Long> {

    List<QuoteHistory> findByTypeAndDateBetweenOrderByDateAsc(
            CurrencyType type, LocalDate startDate, LocalDate endDate);

    @Query("SELECT q FROM QuoteHistory q WHERE q.type = :type AND q.date < :date ORDER BY q.date DESC LIMIT 1")
    Optional<QuoteHistory> findLatestByTypeBeforeDate(CurrencyType type, LocalDate date);

    @Query("SELECT q FROM QuoteHistory q WHERE q.type IN :types AND q.date = " +
           "(SELECT MAX(q2.date) FROM QuoteHistory q2 WHERE q2.type = q.type AND q2.date < :date)")
    List<QuoteHistory> findLatestByTypesBeforeDate(@Param("types") List<CurrencyType> types, @Param("date") LocalDate date);

}
