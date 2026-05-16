package com.bodegon.club.service;

import com.bodegon.club.dto.admin.AdminDto;
import com.bodegon.club.dto.member.MemberDto;
import com.bodegon.club.entity.MemberProfile;
import com.bodegon.club.entity.User;
import com.bodegon.club.entity.enums.MemberLevel;
import com.bodegon.club.entity.enums.Role;
import com.bodegon.club.entity.enums.TransactionSource;
import com.bodegon.club.entity.enums.UserStatus;
import com.bodegon.club.repository.MemberProfileRepository;
import com.bodegon.club.repository.PointsTransactionRepository;
import com.bodegon.club.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberService {

    private final MemberProfileRepository memberProfileRepository;
    private final PointsTransactionRepository pointsTransactionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PointsService pointsService;

    @Value("${app.business.points-rate-purchase:0.01}")
    private double pointsRatePurchase;

    @Transactional(readOnly = true)
    public MemberLevel getMemberLevel(String email) {
        return userRepository.findByEmail(email)
                .flatMap(u -> memberProfileRepository.findByUserId(u.getId()))
                .map(MemberProfile::getLevel)
                .orElse(MemberLevel.BRONZE);
    }

    @Transactional(readOnly = true)
    public MemberDto.Response getMemberProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        MemberProfile profile = memberProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return mapToDto(user, profile);
    }

    @Transactional(readOnly = true)
    public Page<MemberDto.TransactionResponse> getMyTransactions(String email, Pageable pageable) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        MemberProfile profile = memberProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return pointsTransactionRepository.findByMemberId(profile.getId(), pageable)
                .map(this::mapTxToDto);
    }

    @Transactional
    public MemberDto.Response updateProfile(String email, MemberDto.UpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        MemberProfile profile = memberProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().isBlank() ? null : request.getPhone());
        }
        if (request.getBirthDate() != null) {
            profile.setBirthDate(request.getBirthDate());
        }
        userRepository.save(user);
        memberProfileRepository.save(profile);
        return mapToDto(user, profile);
    }

    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("La contraseña actual es incorrecta");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<MemberDto.Response> getAllMembers() {
        return memberProfileRepository.findAll().stream()
                .map(profile -> mapToDto(profile.getUser(), profile))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStats() {
        long total = memberProfileRepository.count();
        long bronze = memberProfileRepository.countByLevel(MemberLevel.BRONZE);
        long silver = memberProfileRepository.countByLevel(MemberLevel.SILVER);
        long gold = memberProfileRepository.countByLevel(MemberLevel.GOLD);
        long totalPointsIssued = memberProfileRepository.sumTotalPointsEarned();
        long totalPointsInCirculation = memberProfileRepository.sumCurrentPoints();
        return Map.of(
                "totalMembers", total,
                "bronze", bronze,
                "silver", silver,
                "gold", gold,
                "totalPointsIssued", totalPointsIssued,
                "totalPointsInCirculation", totalPointsInCirculation
        );
    }

    @Transactional(readOnly = true)
    public Optional<MemberDto.Response> findByDni(String dni) {
        String trimmedDni = dni != null ? dni.trim() : "";
        log.info("Searching for member with DNI: {}", trimmedDni);
        return userRepository.findByDni(trimmedDni)
                .map(user -> {
                    log.info("User found: {}. Searching for profile...", user.getEmail());
                    return memberProfileRepository.findByUserId(user.getId())
                            .map(profile -> mapToDto(user, profile))
                            .orElseThrow(() -> new RuntimeException("User found but profile missing for DNI: " + dni));
                });
    }

    @Transactional
    public AdminDto.PurchaseResponse registerPurchase(AdminDto.PurchaseRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        Optional<User> existing = userRepository.findByDni(request.getDni());
        boolean newAccount = existing.isEmpty();

        User user;
        MemberProfile profile;

        if (newAccount) {
            if (request.getFullName() == null || request.getFullName().isBlank()) {
                throw new IllegalArgumentException("El nombre es obligatorio para nuevas cuentas");
            }
            if (request.getEmail() == null || request.getEmail().isBlank()) {
                throw new IllegalArgumentException("El email es obligatorio para nuevas cuentas");
            }
            if (request.getBirthDate() == null) {
                throw new IllegalArgumentException("La fecha de nacimiento es obligatoria para nuevas cuentas");
            }
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Ya existe una cuenta con ese email");
            }
            user = User.builder()
                    .fullName(request.getFullName())
                    .dni(request.getDni())
                    .phone(request.getPhone() != null && !request.getPhone().isBlank() ? request.getPhone() : null)
                    .email(request.getEmail().trim())
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(Role.MEMBER)
                    .status(UserStatus.ACTIVE)
                    .build();
            user = userRepository.save(user);
            profile = memberProfileRepository.save(MemberProfile.builder()
                    .user(user)
                    .birthDate(request.getBirthDate())
                    .build());
        } else {
            user = existing.get();
            profile = memberProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Profile not found"));
        }

        // Increment visits and save immediately
        profile.setTotalVisits(profile.getTotalVisits() + 1);
        profile = memberProfileRepository.save(profile);

        int points = (int) Math.floor(request.getAmount() * pointsRatePurchase);
        if (points > 0) {
            pointsService.earnPoints(profile.getId(), points, TransactionSource.PURCHASE,
                    "Compra $" + request.getAmount(), admin);
            // Refresh profile to get the new points balance
            profile = memberProfileRepository.findById(profile.getId()).orElseThrow();
        }

        return AdminDto.PurchaseResponse.builder()
                .memberId(profile.getId())
                .fullName(user.getFullName())
                .dni(user.getDni())
                .pointsEarned(points)
                .currentPoints(profile.getCurrentPoints())
                .newAccount(newAccount)
                .build();
    }

    public MemberDto.Response mapToDto(User user, MemberProfile profile) {
        return MemberDto.Response.builder()
                .userId(user.getId())
                .memberId(profile.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .dni(user.getDni())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .level(profile.getLevel())
                .currentPoints(profile.getCurrentPoints())
                .totalPointsEarned(profile.getTotalPointsEarned())
                .totalVisits(profile.getTotalVisits())
                .birthDate(profile.getBirthDate())
                .memberSince(user.getCreatedAt())
                .build();
    }

    private MemberDto.TransactionResponse mapTxToDto(com.bodegon.club.entity.PointsTransaction tx) {
        return MemberDto.TransactionResponse.builder()
                .id(tx.getId())
                .type(tx.getType().name())
                .source(tx.getSource().name())
                .points(tx.getPoints())
                .description(tx.getDescription())
                .createdAt(tx.getCreatedAt().toString())
                .build();
    }
}
