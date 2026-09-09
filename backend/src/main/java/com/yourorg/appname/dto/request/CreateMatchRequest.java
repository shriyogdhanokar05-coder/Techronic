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
public class CreateMatchRequest {

    @NotBlank(message = "Game mode is required")
    private String gameMode; // ONLINE_RANKED, QUICK_MATCH, VS_AI, HOTSEAT

    private String aiDifficulty; // EASY, MEDIUM, HARD, EXPERT

    private String opponentTag;
}
