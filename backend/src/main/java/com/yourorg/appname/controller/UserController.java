package com.yourorg.appname.controller;

import com.yourorg.appname.dto.request.ProfileUpdateRequest;
import com.yourorg.appname.dto.response.ApiResponse;
import com.yourorg.appname.dto.response.UserResponse;
import com.yourorg.appname.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping({"/profile", "/me"})
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
        UserResponse user = userService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserProfile(id);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@RequestBody ProfileUpdateRequest request) {
        UserResponse updated = userService.updateProfile(request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }
}
