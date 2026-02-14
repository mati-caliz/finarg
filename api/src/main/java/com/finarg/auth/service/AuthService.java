package com.finarg.auth.service;

import com.finarg.core.exception.EmailAlreadyRegisteredException;
import com.finarg.core.exception.InvalidTokenException;
import com.finarg.core.exception.UserNotFoundException;
import com.finarg.auth.dto.AuthRequestDTO;
import com.finarg.auth.dto.AuthResponseDTO;
import com.finarg.user.dto.UserDTO;
import com.finarg.user.entity.User;
import com.finarg.user.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final GoogleIdTokenVerifierService googleIdTokenVerifier;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Lazy AuthenticationManager authenticationManager,
            GoogleIdTokenVerifierService googleIdTokenVerifier
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.googleIdTokenVerifier = googleIdTokenVerifier;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmailIgnoreCase(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public AuthResponseDTO register(AuthRequestDTO request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        log.info("Registering new user: {}", maskEmail(email));

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyRegisteredException();
        }

        User user = User.builder()
                .name(request.getName() != null ? request.getName().trim() : "")
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .emailVerified(false)
                .emailNotifications(true)
                .pushNotifications(false)
                .build();

        userRepository.save(user);

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    public AuthResponseDTO login(AuthRequestDTO request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        log.info("User login: {}", maskEmail(email));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(UserNotFoundException::new);

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    public AuthResponseDTO refreshToken(String refreshToken) {
        String email = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(UserNotFoundException::new);

        if (!jwtService.isTokenValid(refreshToken, user) || !jwtService.isRefreshToken(refreshToken)) {
            throw new InvalidTokenException();
        }

        String newAccessToken = jwtService.generateToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);

        return buildAuthResponse(user, newAccessToken, newRefreshToken);
    }

    public AuthResponseDTO loginWithGoogle(String idToken) {
        GoogleIdToken.Payload payload = googleIdTokenVerifier.verify(idToken);
        if (payload == null) {
            throw new IllegalArgumentException("Token de Google inválido");
        }
        String email = payload.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("El token de Google no contiene email");
        }
        final String emailNormalized = email.trim().toLowerCase();
        final String name = payload.get("name") != null ? payload.get("name").toString().trim() : emailNormalized;

        User user = userRepository.findByEmailIgnoreCase(emailNormalized).orElseGet(() -> {
            User newUser = User.builder()
                    .name(name)
                    .email(emailNormalized)
                    .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .emailVerified(true)
                    .emailNotifications(true)
                    .pushNotifications(false)
                    .build();
            return userRepository.save(newUser);
        });

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "***";
        }
        String[] parts = email.split("@");
        String local = parts[0];
        String masked = local.length() <= 2 ? "***" : local.charAt(0) + "***" + local.charAt(local.length() - 1);
        return masked + "@" + parts[1];
    }

    private AuthResponseDTO buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .user(UserDTO.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .emailVerified(user.isEmailVerified())
                        .build())
                .build();
    }
}
