package com.bodegon.club.repository;

import com.bodegon.club.entity.MemberProfile;
import com.bodegon.club.entity.enums.MemberLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.UUID;

public interface MemberProfileRepository extends JpaRepository<MemberProfile, UUID> {
    Optional<MemberProfile> findByUserId(UUID userId);

    long countByLevel(MemberLevel level);

    @Query("SELECT COALESCE(SUM(m.totalPointsEarned), 0) FROM MemberProfile m")
    long sumTotalPointsEarned();

    @Query("SELECT COALESCE(SUM(m.currentPoints), 0) FROM MemberProfile m")
    long sumCurrentPoints();
}
