package com.bodegon.club.repository;

import com.bodegon.club.entity.Promotion;
import com.bodegon.club.entity.enums.PromotionStatus;
import com.bodegon.club.entity.enums.PromotionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface PromotionRepository extends JpaRepository<Promotion, UUID> {

    @Query("SELECT p FROM Promotion p WHERE p.status = 'PUBLISHED' " +
            "AND p.startAt <= :now AND p.endAt >= :now " +
            "AND (:type IS NULL OR p.type = :type)")
    List<Promotion> findActivePromotions(@Param("now") LocalDateTime now, @Param("type") PromotionType type);
}
