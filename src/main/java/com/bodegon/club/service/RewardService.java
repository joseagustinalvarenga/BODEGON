package com.bodegon.club.service;

import com.bodegon.club.dto.reward.RewardDto;
import com.bodegon.club.entity.Reward;
import com.bodegon.club.entity.enums.MemberLevel;
import com.bodegon.club.entity.enums.RewardTrigger;
import com.bodegon.club.repository.RewardRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RewardService {

    private final RewardRepository rewardRepository;

    /** Para el cliente: solo recompensas activas accesibles para su nivel */
    public List<RewardDto.Response> getActiveRewards(MemberLevel memberLevel) {
        return rewardRepository.findByActiveTrue().stream()
                .filter(r -> r.getRequiredLevel() == null || isLevelSufficient(memberLevel, r.getRequiredLevel()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /** Para el admin: todas */
    public List<RewardDto.Response> getAllRewards() {
        return rewardRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public RewardDto.Response createReward(RewardDto.Request request) {
        RewardTrigger trigger = request.getTriggerType() != null ? request.getTriggerType() : RewardTrigger.ALWAYS;
        Reward reward = Reward.builder()
                .name(request.getName())
                .description(request.getDescription())
                .pointsCost(request.getPointsCost())
                .stock(request.getStock())
                .validFrom(request.getValidFrom())
                .validTo(request.getValidTo())
                .triggerType(trigger)
                .triggerValue(request.getTriggerValue())
                .requiredLevel(request.getRequiredLevel())
                .active(true)
                .build();
        return mapToDto(rewardRepository.save(reward));
    }

    @Transactional
    public RewardDto.Response updateReward(UUID id, RewardDto.Request request) {
        Reward reward = rewardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reward not found"));
        reward.setName(request.getName());
        reward.setDescription(request.getDescription());
        reward.setPointsCost(request.getPointsCost());
        reward.setStock(request.getStock());
        reward.setValidFrom(request.getValidFrom());
        reward.setValidTo(request.getValidTo());
        reward.setTriggerType(request.getTriggerType() != null ? request.getTriggerType() : RewardTrigger.ALWAYS);
        reward.setTriggerValue(request.getTriggerValue());
        reward.setRequiredLevel(request.getRequiredLevel());
        return mapToDto(rewardRepository.save(reward));
    }

    @Transactional
    public RewardDto.Response toggleReward(UUID id) {
        Reward reward = rewardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reward not found"));
        reward.setActive(!reward.getActive());
        return mapToDto(rewardRepository.save(reward));
    }

    /** true si el nivel del miembro cumple o supera el requerido */
    private boolean isLevelSufficient(MemberLevel member, MemberLevel required) {
        if (member == null) return false;
        return levelRank(member) >= levelRank(required);
    }

    private int levelRank(MemberLevel level) {
        return switch (level) {
            case BRONZE -> 1;
            case SILVER -> 2;
            case GOLD   -> 3;
        };
    }

    private RewardDto.Response mapToDto(Reward r) {
        return RewardDto.Response.builder()
                .id(r.getId())
                .name(r.getName())
                .description(r.getDescription())
                .pointsCost(r.getPointsCost())
                .stock(r.getStock())
                .active(r.getActive())
                .validFrom(r.getValidFrom())
                .validTo(r.getValidTo())
                .triggerType(r.getTriggerType())
                .triggerValue(r.getTriggerValue())
                .requiredLevel(r.getRequiredLevel())
                .build();
    }
}
