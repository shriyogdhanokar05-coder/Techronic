package com.yourorg.appname.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {

    @NotBlank(message = "Username or email is required")
    private String username;

    @NotBlank(message = "New passcode is required")
    @Size(min = 6, message = "Passcode must be at least 6 characters")
    private String newPassword;
}
