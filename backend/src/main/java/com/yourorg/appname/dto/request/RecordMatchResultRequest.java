package com.yourorg.appname.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordMatchResultRequest {

    @NotBlank(message = "Result type is required")
    private String resultType; // 'WIN', 'LOSS', 'DRAW'

    private Integer player1Score;
    private Integer player2Score;
    private String boardState;
    private Integer durationSeconds;
    private String gameMode;
    private String aiDifficulty;
    private String opponentTag;
}
