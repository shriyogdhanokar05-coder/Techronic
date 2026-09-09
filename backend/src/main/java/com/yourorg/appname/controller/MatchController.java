package com.yourorg.appname.controller;

import com.yourorg.appname.dto.request.CreateMatchRequest;
import com.yourorg.appname.dto.request.RecordMatchResultRequest;
import com.yourorg.appname.dto.response.ApiResponse;
import com.yourorg.appname.dto.response.MatchResponse;
import com.yourorg.appname.service.MatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @PostMapping
    public ResponseEntity<ApiResponse<MatchResponse>> createMatch(@Valid @RequestBody CreateMatchRequest request) {
        MatchResponse match = matchService.createMatch(request);
        return ResponseEntity.ok(ApiResponse.ok("Match initialized", match));
    }

    @PostMapping("/{id}/result")
    public ResponseEntity<ApiResponse<MatchResponse>> recordResult(
            @PathVariable Long id,
            @Valid @RequestBody RecordMatchResultRequest request
    ) {
        MatchResponse match = matchService.recordMatchResult(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Match result recorded", match));
    }

    @PostMapping("/quick-result")
    public ResponseEntity<ApiResponse<MatchResponse>> recordQuickResult(
            @Valid @RequestBody RecordMatchResultRequest request
    ) {
        MatchResponse match = matchService.recordQuickResult(request);
        return ResponseEntity.ok(ApiResponse.ok("Match result saved", match));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> getRecentMatches(
            @RequestParam(defaultValue = "5") int limit
    ) {
        List<MatchResponse> matches = matchService.getRecentMatches(limit);
        return ResponseEntity.ok(ApiResponse.ok(matches));
    }

    @GetMapping("/last-encounter")
    public ResponseEntity<ApiResponse<MatchResponse>> getLastEncounter() {
        MatchResponse match = matchService.getLastEncounter();
        return ResponseEntity.ok(ApiResponse.ok(match));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<MatchResponse>>> getMatchHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<MatchResponse> history = matchService.getUserMatchHistory(page, size);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }
}
