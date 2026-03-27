package com.bodegon.club.service;

import com.bodegon.club.dto.redemption.RedemptionDto;
import com.bodegon.club.entity.*;
import com.bodegon.club.entity.enums.RedemptionStatus;
import com.bodegon.club.entity.enums.TransactionSource;
import com.bodegon.club.entity.enums.TransactionType;
import com.bodegon.club.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RedemptionService {

    private final RedemptionRepository redemptionRepository;
    private final RewardRepository rewardRepository;
    private final MemberProfileRepository memberProfileRepository;
    private final UserRepository userRepository;
    private final PointsTransactionRepository pointsTransactionRepository;

    @Value("${app.business.redemption-expires-days:7}")
    private int expiresDays;

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private final SecureRandom random = new SecureRandom();

    @Transactional
    public RedemptionDto.Response redeemReward(UUID userId, UUID rewardId) {
        MemberProfile member = memberProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Member profile not found"));

        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new RuntimeException("Reward not found"));

        if (!Boolean.TRUE.equals(reward.getActive())) {
            throw new RuntimeException("Reward is not active");
        }

        if (reward.getStock() != null && reward.getStock() <= 0) {
            throw new RuntimeException("Out of stock");
        }

        if (member.getCurrentPoints() < reward.getPointsCost()) {
            throw new IllegalArgumentException("Insufficient points");
        }

        // Deduct points
        member.setCurrentPoints(member.getCurrentPoints() - reward.getPointsCost());
        memberProfileRepository.save(member);

        // Record REDEEM transaction
        PointsTransaction tx = PointsTransaction.builder()
                .member(member)
                .type(TransactionType.REDEEM)
                .source(TransactionSource.REWARD_REDEEM)
                .points(-reward.getPointsCost())
                .description("Canje: " + reward.getName())
                .build();
        pointsTransactionRepository.save(tx);

        // Decrement stock
        if (reward.getStock() != null) {
            reward.setStock(reward.getStock() - 1);
            rewardRepository.save(reward);
        }

        // Generate Code
        String code = generateUniqueCode();

        // Create Redemption
        Redemption redemption = Redemption.builder()
                .member(member)
                .reward(reward)
                .pointsSpent(reward.getPointsCost())
                .code(code)
                .status(RedemptionStatus.ISSUED)
                .issuedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(expiresDays))
                .build();

        redemptionRepository.save(redemption);

        return mapToDto(redemption);
    }

    @Transactional
    public RedemptionDto.Response validateRedemption(String code, UUID adminId) {
        Redemption redemption = redemptionRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Code not found"));

        if (redemption.getStatus() != RedemptionStatus.ISSUED) {
            throw new RuntimeException("Code is not ISSUED (Status: " + redemption.getStatus() + ")");
        }

        if (redemption.getExpiresAt() != null && redemption.getExpiresAt().isBefore(LocalDateTime.now())) {
            redemption.setStatus(RedemptionStatus.EXPIRED);
            redemptionRepository.save(redemption);
            throw new RuntimeException("Code expired");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        redemption.setStatus(RedemptionStatus.REDEEMED);
        redemption.setRedeemedAt(LocalDateTime.now());
        redemption.setRedeemedBy(admin);

        return mapToDto(redemptionRepository.save(redemption));
    }

    @Transactional(readOnly = true)
    public List<RedemptionDto.Response> getMemberRedemptions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        MemberProfile member = memberProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return redemptionRepository.findByMember_IdOrderByIssuedAtDesc(member.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RedemptionDto.AdminResponse> getIssuedRedemptions() {
        return redemptionRepository.findByStatus(RedemptionStatus.ISSUED).stream()
                .map(this::mapToAdminDto)
                .collect(Collectors.toList());
    }

    private RedemptionDto.AdminResponse mapToAdminDto(Redemption r) {
        return RedemptionDto.AdminResponse.builder()
                .id(r.getId())
                .code(r.getCode())
                .memberName(r.getMember().getUser().getFullName())
                .memberEmail(r.getMember().getUser().getEmail())
                .rewardName(r.getReward().getName())
                .pointsSpent(r.getPointsSpent())
                .status(r.getStatus())
                .issuedAt(r.getIssuedAt())
                .expiresAt(r.getExpiresAt())
                .build();
    }

    private String generateUniqueCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder("BDG-");
            for (int i = 0; i < 6; i++) {
                sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
            }
            code = sb.toString();
        } while (redemptionRepository.existsByCode(code));
        return code;
    }

    private RedemptionDto.Response mapToDto(Redemption r) {
        return RedemptionDto.Response.builder()
                .id(r.getId())
                .code(r.getCode())
                .rewardName(r.getReward().getName())
                .pointsSpent(r.getPointsSpent())
                .status(r.getStatus())
                .issuedAt(r.getIssuedAt())
                .expiresAt(r.getExpiresAt())
                .build();
    }
}
