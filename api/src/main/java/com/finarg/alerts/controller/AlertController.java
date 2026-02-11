package com.finarg.alerts.controller;

import com.finarg.alerts.dto.AlertRequestDTO;
import com.finarg.alerts.dto.AlertResponseDTO;
import com.finarg.user.entity.User;
import com.finarg.alerts.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
@Tag(name = "Alerts", description = "User alert management")
@SecurityRequirement(name = "bearerAuth")
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    @Operation(summary = "Get user alerts")
    public ResponseEntity<List<AlertResponseDTO>> getAlerts(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(alertService.getAlertsByUserId(user.getId()));
    }

    @PostMapping
    @Operation(summary = "Create new alert")
    public ResponseEntity<AlertResponseDTO> createAlert(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AlertRequestDTO request) {
        return ResponseEntity.ok(alertService.createAlert(user.getId(), request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete alert")
    public ResponseEntity<Void> deleteAlert(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        alertService.deleteAlert(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Toggle alert active status")
    public ResponseEntity<AlertResponseDTO> toggleAlert(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(alertService.toggleAlert(id, user.getId()));
    }
}
