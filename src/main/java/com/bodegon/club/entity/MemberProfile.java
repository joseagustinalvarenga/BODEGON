package com.bodegon.club.entity;

import com.bodegon.club.entity.enums.MemberLevel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "member_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberProfile extends BaseEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MemberLevel level = MemberLevel.BRONZE;

    @Column(name = "total_points_earned")
    @Builder.Default
    private Integer totalPointsEarned = 0;

    @Column(name = "current_points")
    @Builder.Default
    private Integer currentPoints = 0;

    @Column(name = "total_visits")
    @Builder.Default
    private Integer totalVisits = 0;

    private String notes;
}
