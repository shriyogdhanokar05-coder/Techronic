package com.yourorg.appname.mapper;

import com.yourorg.appname.dto.response.MatchResponse;
import com.yourorg.appname.entity.MatchRecord;
import org.springframework.stereotype.Component;

@Component
public class MatchMapper {

    public MatchResponse toMatchResponse(MatchRecord match) {
        if (match == null) return null;

        return MatchResponse.builder()
                .id(match.getId())
                .roomCode(match.getRoomCode())
                .player1Id(match.getPlayer1() != null ? match.getPlayer1().getId() : null)
                .player2Id(match.getPlayer2() != null ? match.getPlayer2().getId() : null)
                .player1Tag(match.getPlayer1Tag())
                .player2Tag(match.getPlayer2Tag())
                .winnerId(match.getWinner() != null ? match.getWinner().getId() : null)
                .resultType(match.getResultType())
                .player1Score(match.getPlayer1Score())
                .player2Score(match.getPlayer2Score())
                .gameMode(match.getGameMode())
                .aiDifficulty(match.getAiDifficulty())
                .crChange(match.getCrChange())
                .xpEarned(match.getXpEarned())
                .boardState(match.getBoardState())
                .durationSeconds(match.getDurationSeconds())
                .createdAt(match.getCreatedAt())
                .build();
    }
}
