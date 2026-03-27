package com.bodegon.club.service;

import com.bodegon.club.dto.auth.AuthenticationRequest;
import com.bodegon.club.dto.auth.AuthenticationResponse;
import com.bodegon.club.dto.auth.RegisterRequest;
import com.bodegon.club.entity.MemberProfile;
import com.bodegon.club.entity.RefreshToken;
import com.bodegon.club.entity.User;
import com.bodegon.club.entity.enums.Role;
import com.bodegon.club.entity.enums.UserStatus;
import com.bodegon.club.repository.MemberProfileRepository;
import com.bodegon.club.repository.RefreshTokenRepository;
import com.bodegon.club.repository.UserRepository;
import com.bodegon.club.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final MemberProfileRepository memberProfileRepository;
        private final RefreshTokenRepository refreshTokenRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        @Transactional
        public AuthenticationResponse register(RegisterRequest request) {
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already active"); // TODO: Use Custom Exception
                }

                var user = User.builder()
                                .fullName(request.getFullName())
                                .email(request.getEmail())
                                .phone(request.getPhone())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .role(Role.MEMBER) // Default role
                                .status(UserStatus.ACTIVE)
                                .build();

                var savedUser = userRepository.save(user);

                // Create Member Profile for Members
                var profile = MemberProfile.builder()
                                .user(savedUser)
                                .build();
                memberProfileRepository.save(profile);

                // Authenticate implicitly (or just generate tokens)
                // Here we just generate tokens for the new user
                var springUser = org.springframework.security.core.userdetails.User.builder()
                                .username(savedUser.getEmail())
                                .password(savedUser.getPasswordHash())
                                .roles(savedUser.getRole().name())
                                .build();

                var jwtToken = jwtService.generateToken(springUser);
                var refreshToken = jwtService.generateRefreshToken(springUser);

                saveUserRefreshToken(savedUser, refreshToken);

                return AuthenticationResponse.builder()
                                .accessToken(jwtToken)
                                .refreshToken(refreshToken)
                                .build();
        }

        @Transactional
        public AuthenticationResponse authenticate(AuthenticationRequest request) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));
                var user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

                // Update last login
                user.setLastLoginAt(LocalDateTime.now());
                userRepository.save(user);

                var springUser = org.springframework.security.core.userdetails.User.builder()
                                .username(user.getEmail())
                                .password(user.getPasswordHash())
                                .roles(user.getRole().name())
                                .build();

                var jwtToken = jwtService.generateToken(springUser);
                var refreshToken = jwtService.generateRefreshToken(springUser);

                // Revoke all existing tokens for this user (or just add new one? For now valid
                // replacement)
                revokeAllUserTokens(user);
                saveUserRefreshToken(user, refreshToken);

                return AuthenticationResponse.builder()
                                .accessToken(jwtToken)
                                .refreshToken(refreshToken)
                                .build();
        }

        private void saveUserRefreshToken(User user, String jwtToken) {
                var token = RefreshToken.builder()
                                .user(user)
                                .tokenHash(jwtToken) // Storing plain JWT as hash for now (simplification, ideally hash
                                                     // it)
                                .expiresAt(LocalDateTime.now().plusDays(7)) // TODO: configuration
                                .build();
                refreshTokenRepository.save(token);
        }

        private void revokeAllUserTokens(User user) {
                // In this simple implementation we just delete all
                refreshTokenRepository.deleteByUser(user);
        }
}
