package com.finarg.auth.controller;

import com.finarg.auth.dto.AuthRequestDTO;
import com.finarg.auth.dto.AuthResponseDTO;
import com.finarg.auth.dto.GoogleAuthRequestDTO;
import com.finarg.auth.service.AuthService;
import com.finarg.auth.service.CookieService;
import com.finarg.auth.service.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticacion", description = "Endpoints de autenticacion y registro")
public class AuthController {

    private final AuthService authService;
    private final CookieService cookieService;
    private final JwtService jwtService;

    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario")
    public ResponseEntity<AuthResponseDTO> register(
            @Valid @RequestBody AuthRequestDTO request,
            HttpServletResponse response) {
        AuthResponseDTO authResponse = authService.register(request);
        setAuthCookies(response, authResponse);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesion")
    public ResponseEntity<AuthResponseDTO> login(
            @Valid @RequestBody AuthRequestDTO request,
            HttpServletResponse response) {
        AuthResponseDTO authResponse = authService.login(request);
        setAuthCookies(response, authResponse);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/google")
    @Operation(summary = "Iniciar sesion con Google")
    public ResponseEntity<AuthResponseDTO> loginWithGoogle(
            @Valid @RequestBody GoogleAuthRequestDTO request,
            HttpServletResponse response) {
        AuthResponseDTO authResponse = authService.loginWithGoogle(request.getIdToken());
        setAuthCookies(response, authResponse);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refrescar token de acceso")
    public ResponseEntity<AuthResponseDTO> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {
        String refreshToken = extractRefreshTokenFromCookie(request);
        AuthResponseDTO authResponse = authService.refreshToken(refreshToken);
        setAuthCookies(response, authResponse);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesion")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        response.addCookie(cookieService.createDeleteCookie("accessToken"));
        response.addCookie(cookieService.createDeleteCookie("refreshToken"));
        return ResponseEntity.ok().build();
    }

    private void setAuthCookies(HttpServletResponse response, AuthResponseDTO authResponse) {
        Cookie accessTokenCookie = cookieService.createAccessTokenCookie(
                authResponse.getAccessToken(),
                jwtService.getExpirationTime()
        );
        Cookie refreshTokenCookie = cookieService.createRefreshTokenCookie(
                authResponse.getRefreshToken(),
                jwtService.getRefreshExpirationTime()
        );
        response.addCookie(accessTokenCookie);
        response.addCookie(refreshTokenCookie);
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            throw new IllegalArgumentException("No refresh token found");
        }
        return Arrays.stream(request.getCookies())
                .filter(cookie -> "refreshToken".equals(cookie.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(() -> new IllegalArgumentException("No refresh token found"));
    }
}
