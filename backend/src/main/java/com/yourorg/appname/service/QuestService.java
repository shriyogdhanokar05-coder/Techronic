package com.yourorg.appname.service;

import com.yourorg.appname.dto.response.QuestResponse;

import java.util.List;

public interface QuestService {

    List<QuestResponse> getTacticalQuests();

    List<QuestResponse> getPublicQuests();
}
