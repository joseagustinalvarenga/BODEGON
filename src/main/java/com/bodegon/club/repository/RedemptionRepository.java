package com.bodegon.club.repository;

import com.bodegon.club.entity.Redemption;
import com.bodegon.club.entity.enums.RedemptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RedemptionRepository extends JpaRepository<Redemption, UUID> {
    Optional<Redemption> findByCode(String code);

    boolean existsByCode(String code);

    List<Redemption> findByStatus(RedemptionStatus status);

    List<Redemption> findByMember_IdOrderByIssuedAtDesc(UUID memberId);
}
