package com.yourorg.appname.service.impl;

import com.yourorg.appname.dto.request.CreateMatchRequest;
import com.yourorg.appname.dto.request.RecordMatchResultRequest;
import com.yourorg.appname.dto.response.MatchResponse;
import com.yourorg.appname.entity.MatchRecord;
import com.yourorg.appname.entity.User;
import com.yourorg.appname.exception.BadRequestException;
import com.yourorg.appname.exception.ResourceNotFoundException;
import com.yourorg.appname.mapper.MatchMapper;
import com.yourorg.appname.repository.MatchRecordRepository;
import com.yourorg.appname.repository.UserRepository;
import com.yourorg.appname.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private final MatchRecordRepository matchRepository;
    private final UserRepository userRepository;
    private final MatchMapper matchMapper;

    @Override
    @Transactional
    public MatchResponse createMatch(CreateMatchRequest request) {
        User player1 = getAuthenticatedUser();
        String roomCode = "TX-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        String player2Tag = StringUtils.hasText(request.getOpponentTag())
                ? request.getOpponentTag()
                : ("VS_AI".equalsIgnoreCase(request.getGameMode()) ? "NEURAL_AI_" + request.getAiDifficulty() : "RIVAL_PILOT");

        MatchRecord match = MatchRecord.builder()
                .roomCode(roomCode)
                .player1(player1)
                .player1Tag(player1.getGamerTag())
                .player2Tag(player2Tag)
                .resultType("IN_PROGRESS")
                .gameMode(request.getGameMode())
                .aiDifficulty(request.getAiDifficulty())
                .build();

        MatchRecord saved = matchRepository.save(match);
        return matchMapper.toMatchResponse(saved);
    }

    @Override
    @Transactional
    public MatchResponse recordMatchResult(Long matchId, RecordMatchResultRequest request) {
        MatchRecord match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with id: " + matchId));

        return applyMatchResult(match, request);
    }

    @Override
    @Transactional
    public MatchResponse recordQuickResult(RecordMatchResultRequest request) {
        User player1 = getAuthenticatedUser();
        String roomCode = "TX-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        String player2Tag = StringUtils.hasText(request.getOpponentTag())
                ? request.getOpponentTag()
                : ("VS_AI".equalsIgnoreCase(request.getGameMode()) ? "NEURAL_BOT_" + (request.getAiDifficulty() != null ? request.getAiDifficulty() : "HARD") : "VORTEX_99");

        MatchRecord match = MatchRecord.builder()
                .roomCode(roomCode)
                .player1(player1)
                .player1Tag(player1.getGamerTag())
                .player2Tag(player2Tag)
                .gameMode(request.getGameMode() != null ? request.getGameMode() : "ONLINE_RANKED")
                .aiDifficulty(request.getAiDifficulty())
                .build();

        return applyMatchResult(match, request);
    }

    private MatchResponse applyMatchResult(MatchRecord match, RecordMatchResultRequest request) {
        User user = match.getPlayer1();
        String resultType = request.getResultType().toUpperCase();

        int crChange = 0;
        int xpEarned = 0;

        if ("WIN".equals(resultType)) {
            crChange = 24;
            xpEarned = 185;
            user.setVictories(user.getVictories() + 1);
            user.setWinStreak(user.getWinStreak() + 1);
            match.setWinner(user);
        } else if ("LOSS".equals(resultType)) {
            crChange = -15;
            xpEarned = 50;
            user.setDefeats(user.getDefeats() + 1);
            user.setWinStreak(0);
        } else { // DRAW
            crChange = 3;
            xpEarned = 80;
            user.setDraws(user.getDraws() + 1);
        }

        // Apply CR
        int newCr = Math.max(0, user.getCombatRating() + crChange);
        user.setCombatRating(newCr);
        user.setRankDivision(calculateRankDivision(newCr));

        // Apply XP and Level
        int totalXp = user.getCurrentXp() + xpEarned;
        int currentLevel = user.getLevel();
        int xpThreshold = (currentLevel + 1) * 250;
        while (totalXp >= xpThreshold) {
            totalXp -= xpThreshold;
            currentLevel++;
            xpThreshold = (currentLevel + 1) * 250;
        }
        user.setLevel(currentLevel);
        user.setCurrentXp(totalXp);
        userRepository.save(user);

        // Update match record
        match.setResultType(resultType);
        match.setPlayer1Score(request.getPlayer1Score() != null ? request.getPlayer1Score() : ("WIN".equals(resultType) ? 2 : 1));
        match.setPlayer2Score(request.getPlayer2Score() != null ? request.getPlayer2Score() : ("WIN".equals(resultType) ? 1 : 2));
        match.setCrChange(crChange);
        match.setXpEarned(xpEarned);
        match.setBoardState(request.getBoardState());
        match.setDurationSeconds(request.getDurationSeconds() != null ? request.getDurationSeconds() : 45);

        MatchRecord saved = matchRepository.save(match);
        return matchMapper.toMatchResponse(saved);
    }

    private String calculateRankDivision(int cr) {
        if (cr >= 3000) return "GRANDMASTER";
        if (cr >= 2600) return "MASTER";
        if (cr >= 2300) return "DIAMOND III";
        if (cr >= 2000) return "DIAMOND I";
        if (cr >= 1700) return "PLATINUM II";
        if (cr >= 1400) return "GOLD I";
        if (cr >= 1100) return "SILVER II";
        return "BRONZE I";
    }

    @Override
    @Transactional(readOnly = true)
    public List<MatchResponse> getRecentMatches(int limit) {
        User user = getAuthenticatedUser();
        Pageable pageable = PageRequest.of(0, Math.min(limit, 20));
        return matchRepository.findRecentMatchesByUserId(user.getId(), pageable).stream()
                .map(matchMapper::toMatchResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MatchResponse> getUserMatchHistory(int page, int size) {
        User user = getAuthenticatedUser();
        Pageable pageable = PageRequest.of(page, size);
        return matchRepository.findAllMatchesByUserId(user.getId(), pageable)
                .map(matchMapper::toMatchResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public MatchResponse getLastEncounter() {
        User user = getAuthenticatedUser();
        Pageable pageable = PageRequest.of(0, 1);
        List<MatchRecord> recent = matchRepository.findRecentMatchesByUserId(user.getId(), pageable);
        if (recent.isEmpty()) {
            return null;
        }
        return matchMapper.toMatchResponse(recent.get(0));
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("User is not authenticated");
        }

        String username;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
}
