package com.bodegon.club.repository;

import com.bodegon.club.entity.Visit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface VisitRepository extends JpaRepository<Visit, UUID> {
}
