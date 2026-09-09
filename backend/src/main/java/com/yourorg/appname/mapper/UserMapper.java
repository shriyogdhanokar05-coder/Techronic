package com.yourorg.appname.mapper;

import com.yourorg.appname.dto.response.LeaderboardEntryResponse;
import com.yourorg.appname.dto.response.UserResponse;
import com.yourorg.appname.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toUserResponse(User user, Long globalRank) {
        if (user == null) return null;

        int xpForNext = (user.getLevel() + 1) * 250;
        int xpNeeded = Math.max(0, xpForNext - user.getCurrentXp());

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .gamerTag(user.getGamerTag())
                .role(user.getRole())
                .rankDivision(user.getRankDivision())
                .combatRating(user.getCombatRating())
                .level(user.getLevel())
                .currentXp(user.getCurrentXp())
                .xpNeededForNextLevel(xpNeeded)
                .victories(user.getVictories())
                .defeats(user.getDefeats())
                .draws(user.getDraws())
                .winRate(user.getWinRate())
                .winStreak(user.getWinStreak())
                .avatarUrl(user.getAvatarUrl())
                .globalRank(globalRank)
                .createdAt(user.getCreatedAt())
                .build();
    }

    public LeaderboardEntryResponse toLeaderboardEntry(User user, Long rank, boolean isCurrentUser) {
        if (user == null) return null;

        return LeaderboardEntryResponse.builder()
                .rank(rank)
                .userId(user.getId())
                .gamerTag(user.getGamerTag())
                .avatarUrl(user.getAvatarUrl())
                .rankDivision(user.getRankDivision())
                .combatRating(user.getCombatRating())
                .victories(user.getVictories())
                .defeats(user.getDefeats())
                .draws(user.getDraws())
                .winRate(user.getWinRate())
                .winStreak(user.getWinStreak())
                .level(user.getLevel())
                .isCurrentUser(isCurrentUser)
                .build();
    }
}
