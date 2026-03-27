package com.bodegon.club.service;

import com.bodegon.club.dto.reward.RewardDto;
import com.bodegon.club.entity.Reward;
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

    public List<RewardDto.Response> getActiveRewards() {
        return rewardRepository.findByActiveTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<RewardDto.Response> getAllRewards() {
        return rewardRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public RewardDto.Response createReward(RewardDto.Request request) {
        Reward reward = Reward.builder()
                .name(request.getName())
                .description(request.getDescription())
                .pointsCost(request.getPointsCost())
                .stock(request.getStock())
                .validFrom(request.getValidFrom())
                .validTo(request.getValidTo())
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
        return mapToDto(rewardRepository.save(reward));
    }

    @Transactional
    public RewardDto.Response toggleReward(UUID id) {
        Reward reward = rewardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reward not found"));
        reward.setActive(!reward.getActive());
        return mapToDto(rewardRepository.save(reward));
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
                .build();
    }
}
