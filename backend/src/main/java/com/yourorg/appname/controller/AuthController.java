package com.yourorg.appname.controller;

import com.yourorg.appname.dto.request.LoginRequest;
import com.yourorg.appname.dto.request.RegisterRequest;
import com.yourorg.appname.dto.request.ResetPasswordRequest;
import com.yourorg.appname.dto.response.ApiResponse;
import com.yourorg.appname.dto.response.AuthResponse;
import com.yourorg.appname.dto.response.UserResponse;
import com.yourorg.appname.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful", response));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<AuthResponse>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        AuthResponse response = authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Passcode updated successfully", response));
    }

    @DeleteMapping("/user/{username}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String username) {
        authService.deleteUser(username);
        return ResponseEntity.ok(ApiResponse.ok("Pilot profile cleared successfully", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        UserResponse user = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(user));
    }
}
