package com.bodegon.club.service;

import com.bodegon.club.dto.level.LevelConfigDto;
import com.bodegon.club.entity.LevelConfig;
import com.bodegon.club.entity.enums.MemberLevel;
import com.bodegon.club.repository.LevelConfigRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LevelConfigService {

    private final LevelConfigRepository repository;

    public List<LevelConfigDto.Response> getAll() {
        return repository.findAll(Sort.by("threshold")).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public LevelConfigDto.Response update(MemberLevel level, LevelConfigDto.Request req) {
        LevelConfig config = repository.findById(level)
                .orElseThrow(() -> new EntityNotFoundException("Level config not found: " + level));
        config.setThreshold(req.getThreshold());
        config.setPerks(req.getPerks());
        return toDto(repository.save(config));
    }

    public int getThreshold(MemberLevel level) {
        return repository.findById(level)
                .map(LevelConfig::getThreshold)
                .orElse(level == MemberLevel.GOLD ? 5000 : 1000);
    }

    private LevelConfigDto.Response toDto(LevelConfig c) {
        return LevelConfigDto.Response.builder()
                .level(c.getLevel().name())
                .threshold(c.getThreshold())
                .perks(c.getPerks())
                .build();
    }
}
