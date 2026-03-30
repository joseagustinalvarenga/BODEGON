package com.bodegon.club.repository;

import com.bodegon.club.entity.LevelConfig;
import com.bodegon.club.entity.enums.MemberLevel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LevelConfigRepository extends JpaRepository<LevelConfig, MemberLevel> {
}
