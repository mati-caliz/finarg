package com.finarg.reserves.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReserveLiabilityDTO implements Serializable {
    private String id;
    private String name;
    private BigDecimal amount;
}
