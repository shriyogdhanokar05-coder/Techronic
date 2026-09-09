package com.yourorg.appname.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(name = "reward_xp", nullable = false)
    @Builder.Default
    private Integer rewardXp = 150;

    @Column(name = "target_count", nullable = false)
    @Builder.Default
    private Integer targetCount = 1;

    @Column(name = "current_count", nullable = false)
    @Builder.Default
    private Integer currentCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean completed = false;

    @Column(name = "reset_time", length = 50)
    private String resetTime;
}
