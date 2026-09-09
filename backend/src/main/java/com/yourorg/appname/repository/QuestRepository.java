package com.yourorg.appname.repository;

import com.yourorg.appname.entity.Quest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestRepository extends JpaRepository<Quest, Long> {

    List<Quest> findByUserId(Long userId);

    List<Quest> findByUserIdIsNull();
}
