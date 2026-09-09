package com.yourorg.appname.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "gamer_tag", nullable = false, length = 50)
    private String gamerTag;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String role = "ROLE_USER";

    @Column(name = "rank_division", nullable = false, length = 50)
    @Builder.Default
    private String rankDivision = "DIAMOND III";

    @Column(name = "combat_rating", nullable = false)
    @Builder.Default
    private Integer combatRating = 2450;

    @Column(nullable = false)
    @Builder.Default
    private Integer level = 42;

    @Column(name = "current_xp", nullable = false)
    @Builder.Default
    private Integer currentXp = 8450;

    @Column(nullable = false)
    @Builder.Default
    private Integer victories = 342;

    @Column(nullable = false)
    @Builder.Default
    private Integer defeats = 118;

    @Column(nullable = false)
    @Builder.Default
    private Integer draws = 45;

    @Column(name = "win_streak", nullable = false)
    @Builder.Default
    private Integer winStreak = 7;

    @Column(name = "avatar_url", length = 1000)
    private String avatarUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public double getWinRate() {
        int total = victories + defeats + draws;
        if (total == 0) return 0.0;
        return Math.round((double) victories / total * 1000.0) / 10.0;
    }
}
