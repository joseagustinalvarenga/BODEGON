package com.bodegon.club.service;

import com.bodegon.club.entity.MemberProfile;
import com.bodegon.club.entity.PointsTransaction;
import com.bodegon.club.entity.User;
import com.bodegon.club.entity.enums.MemberLevel;
import com.bodegon.club.entity.enums.TransactionSource;
import com.bodegon.club.entity.enums.TransactionType;
import com.bodegon.club.repository.MemberProfileRepository;
import com.bodegon.club.repository.PointsTransactionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PointsService {

    private final MemberProfileRepository memberProfileRepository;
    private final PointsTransactionRepository transactionRepository;

    @Value("${app.business.level.silver-threshold}")
    private int silverThreshold;

    @Value("${app.business.level.gold-threshold}")
    private int goldThreshold;

    @Transactional
    public void earnPoints(UUID memberId, int points, TransactionSource source, String description, User adminUser) {
        MemberProfile profile = memberProfileRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Member Profile not found"));

        // Create Transaction
        PointsTransaction tx = PointsTransaction.builder()
                .member(profile)
                .type(TransactionType.EARN)
                .source(source)
                .points(points)
                .description(description)
                .createdBy(adminUser)
                .build();
        transactionRepository.save(tx);

        // Update Member stats
        profile.setCurrentPoints(profile.getCurrentPoints() + points);
        profile.setTotalPointsEarned(profile.getTotalPointsEarned() + points);

        recalculateLevel(profile);

        memberProfileRepository.save(profile);
    }

    @Transactional
    public void adjustPoints(UUID memberId, int points, String description, User adminUser) {
        MemberProfile profile = memberProfileRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Member Profile not found"));

        // Allow negative adjustments
        PointsTransaction tx = PointsTransaction.builder()
                .member(profile)
                .type(TransactionType.ADJUST)
                .source(TransactionSource.ADMIN_ADJUST)
                .points(points)
                .description(description)
                .createdBy(adminUser)
                .build();
        transactionRepository.save(tx);

        profile.setCurrentPoints(profile.getCurrentPoints() + points);
        if (points > 0) {
            profile.setTotalPointsEarned(profile.getTotalPointsEarned() + points);
        }
        recalculateLevel(profile);
        memberProfileRepository.save(profile);
    }

    private void recalculateLevel(MemberProfile profile) {
        int total = profile.getTotalPointsEarned();
        MemberLevel newLevel = MemberLevel.BRONZE;

        if (total >= goldThreshold) {
            newLevel = MemberLevel.GOLD;
        } else if (total >= silverThreshold) {
            newLevel = MemberLevel.SILVER;
        }

        if (profile.getLevel() != newLevel) {
            profile.setLevel(newLevel);
        }
    }
}
