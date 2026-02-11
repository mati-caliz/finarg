package com.finarg.indicators.social.controller;

import com.finarg.indicators.social.dto.SocialIndicatorsDTO;
import com.finarg.indicators.social.service.SocialIndicatorsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/indicators")
@RequiredArgsConstructor
@Tag(name = "Indicators", description = "Social and economic indicators")
public class SocialIndicatorsController {

    private final SocialIndicatorsService socialIndicatorsService;

    @GetMapping("/social")
    @Operation(summary = "Get social indicators by country")
    public ResponseEntity<SocialIndicatorsDTO> getSocialIndicators(
            @RequestParam(defaultValue = "ar") String country) {
        if (!"ar".equalsIgnoreCase(country)) {
            return ResponseEntity.ok().build();
        }
        SocialIndicatorsDTO dto = socialIndicatorsService.getSocialIndicatorsArgentina();
        return ResponseEntity.ok(dto != null ? dto : SocialIndicatorsDTO.builder().build());
    }
}
