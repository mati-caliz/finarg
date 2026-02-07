package com.finarg.service;

import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class CookieService {

    @Value("${app.cookie.secure:false}")
    private boolean secureCookie;

    @Value("${app.cookie.domain:}")
    private String domain;

    public Cookie createAccessTokenCookie(String token, long expirationMs) {
        Cookie cookie = new Cookie("accessToken", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/");
        cookie.setMaxAge((int) (expirationMs / 1000));
        if (!domain.isEmpty()) {
            cookie.setDomain(domain);
        }
        cookie.setAttribute("SameSite", "Lax");
        return cookie;
    }

    public Cookie createRefreshTokenCookie(String token, long expirationMs) {
        Cookie cookie = new Cookie("refreshToken", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/api/v1/auth/refresh");
        cookie.setMaxAge((int) (expirationMs / 1000));
        if (!domain.isEmpty()) {
            cookie.setDomain(domain);
        }
        cookie.setAttribute("SameSite", "Lax");
        return cookie;
    }

    public Cookie createDeleteCookie(String name) {
        Cookie cookie = new Cookie(name, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(secureCookie);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        if (!domain.isEmpty()) {
            cookie.setDomain(domain);
        }
        return cookie;
    }
}
