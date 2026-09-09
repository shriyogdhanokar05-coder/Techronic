package com.yourorg.appname.service.impl;

import com.yourorg.appname.dto.response.LeaderboardEntryResponse;
import com.yourorg.appname.entity.User;
import com.yourorg.appname.mapper.UserMapper;
import com.yourorg.appname.repository.UserRepository;
import com.yourorg.appname.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardServiceImpl implements LeaderboardService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<LeaderboardEntryResponse> getLeaderboard(String category, String division, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        String filterDivision = ("ALL".equalsIgnoreCase(division) || "ALL DIVISIONS".equalsIgnoreCase(division)) ? null : division;
        String filterSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Page<User> usersPage = userRepository.findLeaderboard(filterDivision, filterSearch, pageable);

        Long currentUserId = getCurrentUserId();
        long startRank = (long) page * size + 1;

        List<LeaderboardEntryResponse> entries = new ArrayList<>();
        long rank = startRank;
        for (User user : usersPage.getContent()) {
            boolean isCurrent = currentUserId != null && currentUserId.equals(user.getId());
            entries.add(userMapper.toLeaderboardEntry(user, rank++, isCurrent));
        }

        return new PageImpl<>(entries, pageable, usersPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaderboardEntryResponse> getTopPodium() {
        Pageable pageable = PageRequest.of(0, 3);
        List<User> topUsers = userRepository.findTop100ByOrderByCombatRatingDesc().stream().limit(3).collect(Collectors.toList());
        Long currentUserId = getCurrentUserId();

        List<LeaderboardEntryResponse> podium = new ArrayList<>();
        long rank = 1;
        for (User user : topUsers) {
            boolean isCurrent = currentUserId != null && currentUserId.equals(user.getId());
            podium.add(userMapper.toLeaderboardEntry(user, rank++, isCurrent));
        }
        return podium;
    }

    @Override
    @Transactional(readOnly = true)
    public LeaderboardEntryResponse getCurrentUserEntry() {
        Long currentUserId = getCurrentUserId();
        if (currentUserId == null) return null;

        Optional<User> userOpt = userRepository.findById(currentUserId);
        if (userOpt.isEmpty()) return null;

        User user = userOpt.get();
        Long rank = userRepository.findRankByCombatRating(user.getCombatRating());
        return userMapper.toLeaderboardEntry(user, rank, true);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        String username;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElse(null);
    }
}
