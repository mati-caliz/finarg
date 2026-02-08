package com.finarg.controller;

import com.finarg.model.dto.CompoundInterestRequestDTO;
import com.finarg.model.dto.CompoundInterestResponseDTO;
import com.finarg.service.CompoundInterestCalculatorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/compound-interest")
@RequiredArgsConstructor
@Tag(name = "Compound Interest", description = "Compound interest calculator")
public class CompoundInterestController {

    private final CompoundInterestCalculatorService compoundInterestService;

    @PostMapping("/calculate")
    @Operation(summary = "Calculate compound interest")
    public ResponseEntity<CompoundInterestResponseDTO> calculate(@Valid @RequestBody CompoundInterestRequestDTO request) {
        return ResponseEntity.ok(compoundInterestService.calculate(request));
    }
}
