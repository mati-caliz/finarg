package com.finarg.investments.bonds.service;

import com.finarg.investments.bonds.dto.BondDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class BondService {

    @Cacheable(value = "bonds", key = "'argentina'")
    public List<BondDTO> getArgentineBonds() {
        log.info("Fetching Argentine government bonds");

        List<BondDTO> bonds = new ArrayList<>();

        bonds.add(BondDTO.builder()
                .ticker("AL30")
                .name("Bonar 2030")
                .issuer("República Argentina")
                .maturity(LocalDate.of(2030, 7, 9))
                .yieldPercent(new BigDecimal("15.5"))
                .price(new BigDecimal("42.50"))
                .currency("USD")
                .rating("CCC")
                .lastUpdate(LocalDateTime.now())
                .build());

        bonds.add(BondDTO.builder()
                .ticker("AL35")
                .name("Bonar 2035")
                .issuer("República Argentina")
                .maturity(LocalDate.of(2035, 7, 9))
                .yieldPercent(new BigDecimal("16.2"))
                .price(new BigDecimal("38.75"))
                .currency("USD")
                .rating("CCC")
                .lastUpdate(LocalDateTime.now())
                .build());

        bonds.add(BondDTO.builder()
                .ticker("GD30")
                .name("Global 2030")
                .issuer("República Argentina")
                .maturity(LocalDate.of(2030, 7, 9))
                .yieldPercent(new BigDecimal("15.8"))
                .price(new BigDecimal("41.20"))
                .currency("USD")
                .rating("CCC")
                .lastUpdate(LocalDateTime.now())
                .build());

        bonds.add(BondDTO.builder()
                .ticker("GD35")
                .name("Global 2035")
                .issuer("República Argentina")
                .maturity(LocalDate.of(2035, 7, 9))
                .yieldPercent(new BigDecimal("16.5"))
                .price(new BigDecimal("37.50"))
                .currency("USD")
                .rating("CCC")
                .lastUpdate(LocalDateTime.now())
                .build());

        bonds.add(BondDTO.builder()
                .ticker("AE38")
                .name("Bonar Euros 2038")
                .issuer("República Argentina")
                .maturity(LocalDate.of(2038, 1, 9))
                .yieldPercent(new BigDecimal("17.0"))
                .price(new BigDecimal("35.80"))
                .currency("EUR")
                .rating("CCC")
                .lastUpdate(LocalDateTime.now())
                .build());

        bonds.add(BondDTO.builder()
                .ticker("AL41")
                .name("Bonar 2041")
                .issuer("República Argentina")
                .maturity(LocalDate.of(2041, 7, 9))
                .yieldPercent(new BigDecimal("17.5"))
                .price(new BigDecimal("33.25"))
                .currency("USD")
                .rating("CCC")
                .lastUpdate(LocalDateTime.now())
                .build());

        log.info("Fetched {} bonds", bonds.size());
        return bonds;
    }
}
