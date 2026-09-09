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
public class MatchResponse {

    private Long id;
    private String roomCode;
    private Long player1Id;
    private Long player2Id;
    private String player1Tag;
    private String player2Tag;
    private Long winnerId;
    private String resultType;
    private Integer player1Score;
    private Integer player2Score;
    private String gameMode;
    private String aiDifficulty;
    private Integer crChange;
    private Integer xpEarned;
    private String boardState;
    private Integer durationSeconds;
    private LocalDateTime createdAt;
}
