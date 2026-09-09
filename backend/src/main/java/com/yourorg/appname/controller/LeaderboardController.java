package com.yourorg.appname.controller;

import com.yourorg.appname.dto.response.ApiResponse;
import com.yourorg.appname.dto.response.LeaderboardEntryResponse;
import com.yourorg.appname.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<LeaderboardEntryResponse>>> getLeaderboard(
            @RequestParam(defaultValue = "GLOBAL") String category,
            @RequestParam(defaultValue = "ALL") String division,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Page<LeaderboardEntryResponse> leaderboard = leaderboardService.getLeaderboard(category, division, search, page, size);
        return ResponseEntity.ok(ApiResponse.ok(leaderboard));
    }

    @GetMapping("/podium")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryResponse>>> getPodium() {
        List<LeaderboardEntryResponse> podium = leaderboardService.getTopPodium();
        return ResponseEntity.ok(ApiResponse.ok(podium));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<LeaderboardEntryResponse>> getMyEntry() {
        LeaderboardEntryResponse myEntry = leaderboardService.getCurrentUserEntry();
        return ResponseEntity.ok(ApiResponse.ok(myEntry));
    }
}
