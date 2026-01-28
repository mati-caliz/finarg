package com.finarg.controller;

import com.finarg.model.dto.AlertaRequestDTO;
import com.finarg.model.dto.AlertaResponseDTO;
import com.finarg.model.entity.User;
import com.finarg.service.AlertaService;
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
@RequestMapping("/api/v1/alertas")
@RequiredArgsConstructor
@Tag(name = "Alertas", description = "Gestion de alertas de usuario")
@SecurityRequirement(name = "bearerAuth")
public class AlertaController {

    private final AlertaService alertaService;

    @GetMapping
    @Operation(summary = "Obtener alertas del usuario")
    public ResponseEntity<List<AlertaResponseDTO>> getAlertas(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(alertaService.getAlertasByUserId(user.getId()));
    }

    @PostMapping
    @Operation(summary = "Crear nueva alerta")
    public ResponseEntity<AlertaResponseDTO> createAlerta(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AlertaRequestDTO request) {
        return ResponseEntity.ok(alertaService.createAlerta(user.getId(), request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar alerta")
    public ResponseEntity<Void> deleteAlerta(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        alertaService.deleteAlerta(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Activar/desactivar alerta")
    public ResponseEntity<AlertaResponseDTO> toggleAlerta(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(alertaService.toggleAlerta(id, user.getId()));
    }
}
