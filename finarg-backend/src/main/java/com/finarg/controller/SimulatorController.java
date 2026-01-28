package com.finarg.controller;

import com.finarg.model.dto.SimulationRequestDTO;
import com.finarg.model.dto.SimulationResponseDTO;
import com.finarg.service.SimulatorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/simulator")
@RequiredArgsConstructor
@Tag(name = "Simulator", description = "Investment return simulator")
public class SimulatorController {

    private final SimulatorService simulatorService;

    @PostMapping("/returns")
    @Operation(summary = "Simulate investment return")
    public ResponseEntity<SimulationResponseDTO> simulate(@Valid @RequestBody SimulationRequestDTO request) {
        return ResponseEntity.ok(simulatorService.simulate(request));
    }

    @GetMapping("/rates")
    @Operation(summary = "Get current investment rates")
    public ResponseEntity<List<SimulatorService.CurrentRate>> getRates() {
        return ResponseEntity.ok(simulatorService.getCurrentRates());
    }
}
