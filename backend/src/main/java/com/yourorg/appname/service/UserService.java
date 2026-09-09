package com.yourorg.appname.service;

import com.yourorg.appname.dto.request.ProfileUpdateRequest;
import com.yourorg.appname.dto.response.UserResponse;

public interface UserService {

    UserResponse getUserProfile(Long userId);

    UserResponse getCurrentUserProfile();

    UserResponse updateProfile(ProfileUpdateRequest request);
}
