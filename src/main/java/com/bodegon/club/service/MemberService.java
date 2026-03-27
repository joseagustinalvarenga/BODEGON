package com.bodegon.club.service;

import com.bodegon.club.dto.member.MemberDto;
import com.bodegon.club.entity.MemberProfile;
import com.bodegon.club.entity.User;
import com.bodegon.club.entity.enums.MemberLevel;
import com.bodegon.club.repository.MemberProfileRepository;
import com.bodegon.club.repository.PointsTransactionRepository;
import com.bodegon.club.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberProfileRepository memberProfileRepository;
    private final PointsTransactionRepository pointsTransactionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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

    public MemberDto.Response mapToDto(User user, MemberProfile profile) {
        return MemberDto.Response.builder()
                .userId(user.getId())
                .memberId(profile.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
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
