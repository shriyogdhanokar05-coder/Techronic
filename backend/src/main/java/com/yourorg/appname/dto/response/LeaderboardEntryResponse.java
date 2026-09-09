package com.yourorg.appname.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryResponse {

    private Long rank;
    private Long userId;
    private String gamerTag;
    private String avatarUrl;
    private String rankDivision;
    private Integer combatRating;
    private Integer victories;
    private Integer defeats;
    private Integer draws;
    private Double winRate;
    private Integer winStreak;
    private Integer level;
    private Boolean isCurrentUser;
}
