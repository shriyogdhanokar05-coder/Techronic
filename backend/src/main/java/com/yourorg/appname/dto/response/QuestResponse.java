package com.yourorg.appname.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestResponse {

    private Long id;
    private String title;
    private String description;
    private Integer rewardXp;
    private Integer targetCount;
    private Integer currentCount;
    private Boolean completed;
    private String resetTime;
}
