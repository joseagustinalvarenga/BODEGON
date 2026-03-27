package com.bodegon.club.service;

import com.bodegon.club.dto.promotion.PromotionDto;
import com.bodegon.club.entity.Promotion;
import com.bodegon.club.entity.User;
import com.bodegon.club.entity.enums.PromotionStatus;
import com.bodegon.club.entity.enums.PromotionType;
import com.bodegon.club.repository.PromotionRepository;
import com.bodegon.club.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final UserRepository userRepository;

    public List<PromotionDto.Response> getAccessablePromotions(boolean isMember) {
        LocalDateTime now = LocalDateTime.now();
        List<Promotion> promotions;
        if (isMember) {
            promotions = promotionRepository.findActivePromotions(now, null); // All types
        } else {
            promotions = promotionRepository.findActivePromotions(now, PromotionType.PUBLIC);
        }
        return promotions.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public PromotionDto.Response createPromotion(PromotionDto.Request request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        Promotion promotion = Promotion.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .status(PromotionStatus.PUBLISHED)
                .imageUrl(request.getImageUrl())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .createdBy(admin)
                .build();

        return mapToDto(promotionRepository.save(promotion));
    }

    @Transactional
    public PromotionDto.Response updatePromotion(UUID id, PromotionDto.Request request) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));

        promotion.setTitle(request.getTitle());
        promotion.setDescription(request.getDescription());
        promotion.setType(request.getType());
        promotion.setStartAt(request.getStartAt());
        promotion.setEndAt(request.getEndAt());
        promotion.setDiscountType(request.getDiscountType());
        promotion.setDiscountValue(request.getDiscountValue());
        if (request.getImageUrl() != null) {
            promotion.setImageUrl(request.getImageUrl());
        }

        return mapToDto(promotionRepository.save(promotion));
    }

    // Simplification: Manual Mapper
    private PromotionDto.Response mapToDto(Promotion p) {
        return PromotionDto.Response.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .type(p.getType())
                .status(p.getStatus())
                .startAt(p.getStartAt())
                .endAt(p.getEndAt())
                .imageUrl(p.getImageUrl())
                .discountType(p.getDiscountType())
                .discountValue(p.getDiscountValue())
                .build();
    }
}
