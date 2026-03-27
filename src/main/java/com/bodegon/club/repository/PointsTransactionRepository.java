package com.bodegon.club.repository;

import com.bodegon.club.entity.PointsTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PointsTransactionRepository extends JpaRepository<PointsTransaction, UUID> {
    Page<PointsTransaction> findByMemberId(UUID memberId, Pageable pageable);
}
