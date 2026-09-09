package com.yourorg.appname.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private String gamerTag;
    private String role;
    private String rankDivision;
    private Integer combatRating;
    private Integer level;
    private Integer currentXp;
    private Integer xpNeededForNextLevel;
    private Integer victories;
    private Integer defeats;
    private Integer draws;
    private Double winRate;
    private Integer winStreak;
    private String avatarUrl;
    private Long globalRank;
    private LocalDateTime createdAt;
}
