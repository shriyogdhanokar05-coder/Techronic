package com.yourorg.appname.service;

import com.yourorg.appname.dto.response.LeaderboardEntryResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface LeaderboardService {

    Page<LeaderboardEntryResponse> getLeaderboard(String category, String division, String search, int page, int size);

    List<LeaderboardEntryResponse> getTopPodium();

    LeaderboardEntryResponse getCurrentUserEntry();
}
