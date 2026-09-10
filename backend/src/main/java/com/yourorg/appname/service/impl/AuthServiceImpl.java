package com.yourorg.appname.service.impl;

import com.yourorg.appname.dto.request.LoginRequest;
import com.yourorg.appname.dto.request.RegisterRequest;
import com.yourorg.appname.dto.request.ResetPasswordRequest;
import com.yourorg.appname.dto.response.AuthResponse;
import com.yourorg.appname.dto.response.UserResponse;
import com.yourorg.appname.entity.User;
import com.yourorg.appname.exception.BadRequestException;
import com.yourorg.appname.exception.ResourceNotFoundException;
import com.yourorg.appname.mapper.UserMapper;
import com.yourorg.appname.repository.MatchRecordRepository;
import com.yourorg.appname.repository.UserRepository;
import com.yourorg.appname.security.JwtUtil;
import com.yourorg.appname.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final MatchRecordRepository matchRecordRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;


    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtUtil.generateToken(user.getUsername());
        Long rank = userRepository.findRankByCombatRating(user.getCombatRating());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpirationMs())
                .user(userMapper.toUserResponse(user, rank))
                .build();
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        String email;
        if (StringUtils.hasText(request.getEmail())) {
            email = request.getEmail().trim();
            if (userRepository.existsByEmail(email)) {
                throw new BadRequestException("Email is already registered");
            }
        } else {
            String sanitized = request.getUsername().toLowerCase().replaceAll("[^a-z0-9_.-]", "");
            email = sanitized + "@techronics.gg";
            if (userRepository.existsByEmail(email)) {
                email = sanitized + "_" + UUID.randomUUID().toString().substring(0, 4) + "@techronics.gg";
            }
        }

        String gamerTag = StringUtils.hasText(request.getGamerTag())
                ? request.getGamerTag().toUpperCase()
                : request.getUsername().toUpperCase();

        String avatarUrl = StringUtils.hasText(request.getAvatarUrl())
                ? request.getAvatarUrl()
                : "https://lh3.googleusercontent.com/aida/AEtjO1XUan5Ffk3FawSQDwTewKBqVm82wK3i_BFHm2D0JQ2Qk8P8_AP1EA3sITSuUr-MmD_Himw6Zi6r_OMSZXFYAB4HnMPVNX-ifE6XEJBUuImUfyBtLGebM6CtapuI8h7FW1Ad5142n-T16Vx6BesBdBgM-KsSM59b1_4SR4PHZWh2mmIXOfITshoScXSphP64N4rTr0AO1F65x9T9fVInh5MbxVnvCu8hIoenKlD6PJDGJF1RxHvRgr2G6k4P";

        User user = User.builder()
                .username(request.getUsername())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .gamerTag(gamerTag)
                .role("ROLE_USER")
                .rankDivision("BRONZE I")
                .combatRating(1200)
                .level(1)
                .currentXp(0)
                .victories(0)
                .defeats(0)
                .draws(0)
                .winStreak(0)
                .avatarUrl(avatarUrl)
                .build();

        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser.getUsername());
        Long rank = userRepository.findRankByCombatRating(savedUser.getCombatRating());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpirationMs())
                .user(userMapper.toUserResponse(savedUser, rank))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
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

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        Long rank = userRepository.findRankByCombatRating(user.getCombatRating());
        return userMapper.toUserResponse(user, rank);
    }

    @Override
    @Transactional
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        String target = request.getUsername().trim();
        User user = userRepository.findByUsername(target)
                .or(() -> userRepository.findByEmail(target))
                .orElseThrow(() -> new ResourceNotFoundException("No pilot found with callsign: " + target));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser.getUsername());
        Long rank = userRepository.findRankByCombatRating(savedUser.getCombatRating());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpirationMs())
                .user(userMapper.toUserResponse(savedUser, rank))
                .build();
    }

    @Override
    @Transactional
    public void deleteUser(String username) {
        String target = username.trim();
        userRepository.findByUsername(target)
                .or(() -> userRepository.findByEmail(target))
                .ifPresent(u -> {
                    matchRecordRepository.deleteMatchesByUserId(u.getId());
                    userRepository.delete(u);
                });
    }
}

