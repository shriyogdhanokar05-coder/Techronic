package com.yourorg.appname.controller;

import com.yourorg.appname.dto.response.ApiResponse;
import com.yourorg.appname.dto.response.QuestResponse;
import com.yourorg.appname.service.QuestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/quests")
@RequiredArgsConstructor
public class QuestController {

    private final QuestService questService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<QuestResponse>>> getQuests() {
        List<QuestResponse> quests = questService.getTacticalQuests();
        return ResponseEntity.ok(ApiResponse.ok(quests));
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<QuestResponse>>> getPublicQuests() {
        List<QuestResponse> quests = questService.getPublicQuests();
        return ResponseEntity.ok(ApiResponse.ok(quests));
    }
}
