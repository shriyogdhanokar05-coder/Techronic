package com.yourorg.appname.service;

import com.yourorg.appname.dto.request.CreateMatchRequest;
import com.yourorg.appname.dto.request.RecordMatchResultRequest;
import com.yourorg.appname.dto.response.MatchResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface MatchService {

    MatchResponse createMatch(CreateMatchRequest request);

    MatchResponse recordMatchResult(Long matchId, RecordMatchResultRequest request);

    MatchResponse recordQuickResult(RecordMatchResultRequest request);

    List<MatchResponse> getRecentMatches(int limit);

    Page<MatchResponse> getUserMatchHistory(int page, int size);

    MatchResponse getLastEncounter();
}
