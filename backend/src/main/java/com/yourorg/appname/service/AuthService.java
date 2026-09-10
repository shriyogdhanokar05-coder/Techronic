package com.yourorg.appname.service;

import com.yourorg.appname.dto.request.LoginRequest;
import com.yourorg.appname.dto.request.RegisterRequest;
import com.yourorg.appname.dto.request.ResetPasswordRequest;
import com.yourorg.appname.dto.response.AuthResponse;
import com.yourorg.appname.dto.response.UserResponse;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    AuthResponse register(RegisterRequest request);

    UserResponse getCurrentUser();

    AuthResponse resetPassword(ResetPasswordRequest request);

    void deleteUser(String username);
}

