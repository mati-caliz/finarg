package com.finarg.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RateDTO {
    private String id;
    private String name;
    private BigDecimal tna;
    private BigDecimal tea;
    private String product;
    private String term;
    private String date;
    private BigDecimal limit;
    private String logo;
    private String link;
}
