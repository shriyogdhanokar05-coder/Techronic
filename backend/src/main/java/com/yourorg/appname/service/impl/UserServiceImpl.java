package com.yourorg.appname.service.impl;

import com.yourorg.appname.dto.request.ProfileUpdateRequest;
import com.yourorg.appname.dto.response.UserResponse;
import com.yourorg.appname.entity.User;
import com.yourorg.appname.exception.BadRequestException;
import com.yourorg.appname.exception.ResourceNotFoundException;
import com.yourorg.appname.mapper.UserMapper;
import com.yourorg.appname.repository.UserRepository;
import com.yourorg.appname.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Long rank = userRepository.findRankByCombatRating(user.getCombatRating());
        return userMapper.toUserResponse(user, rank);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile() {
        User user = getAuthenticatedUser();
        Long rank = userRepository.findRankByCombatRating(user.getCombatRating());
        return userMapper.toUserResponse(user, rank);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(ProfileUpdateRequest request) {
        User user = getAuthenticatedUser();

        if (StringUtils.hasText(request.getGamerTag())) {
            user.setGamerTag(request.getGamerTag().toUpperCase());
        }
        if (StringUtils.hasText(request.getAvatarUrl())) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        User updated = userRepository.save(user);
        Long rank = userRepository.findRankByCombatRating(updated.getCombatRating());
        return userMapper.toUserResponse(updated, rank);
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
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }
}
