package com.yourorg.appname.service.impl;

import com.yourorg.appname.dto.response.QuestResponse;
import com.yourorg.appname.entity.Quest;
import com.yourorg.appname.entity.User;
import com.yourorg.appname.repository.QuestRepository;
import com.yourorg.appname.repository.UserRepository;
import com.yourorg.appname.service.QuestService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestServiceImpl implements QuestService {

    private final QuestRepository questRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<QuestResponse> getTacticalQuests() {
        User user = getAuthenticatedUser();
        List<Quest> quests = questRepository.findByUserId(user.getId());
        if (quests.isEmpty()) {
            quests = questRepository.findByUserIdIsNull();
        }
        return quests.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestResponse> getPublicQuests() {
        return questRepository.findAll().stream().limit(5).map(this::toResponse).collect(Collectors.toList());
    }

    private QuestResponse toResponse(Quest q) {
        return QuestResponse.builder()
                .id(q.getId())
                .title(q.getTitle())
                .description(q.getDescription())
                .rewardXp(q.getRewardXp())
                .targetCount(q.getTargetCount())
                .currentCount(q.getCurrentCount())
                .completed(q.getCompleted())
                .resetTime(q.getResetTime())
                .build();
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        String username;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        return userRepository.findByUsername(username).orElse(null);
    }
}
