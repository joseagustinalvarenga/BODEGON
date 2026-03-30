package com.bodegon.club.entity;

import com.bodegon.club.entity.converter.StringListConverter;
import com.bodegon.club.entity.enums.MemberLevel;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "level_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LevelConfig {

    @Id
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MemberLevel level;

    @Column(nullable = false)
    private int threshold;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT", nullable = false)
    private List<String> perks;
}
