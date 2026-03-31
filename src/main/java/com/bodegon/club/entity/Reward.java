package com.bodegon.club.entity;

import com.bodegon.club.entity.enums.MemberLevel;
import com.bodegon.club.entity.enums.RewardTrigger;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rewards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reward extends BaseEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "points_cost", nullable = false)
    private Integer pointsCost;

    private Integer stock; // Null means unlimited

    @Builder.Default
    private Boolean active = true;

    @Column(name = "valid_from")
    private LocalDateTime validFrom;

    @Column(name = "valid_to")
    private LocalDateTime validTo;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_type", nullable = false)
    @Builder.Default
    private RewardTrigger triggerType = RewardTrigger.ALWAYS;

    // For DAY_OF_WEEK: "MONDAY","TUESDAY",... For BIRTH_DAY_OF_MONTH: not used (day comes from member profile)
    @Column(name = "trigger_value")
    private String triggerValue;

    // Null = disponible para todos los niveles
    @Enumerated(EnumType.STRING)
    @Column(name = "required_level")
    private MemberLevel requiredLevel;
}
