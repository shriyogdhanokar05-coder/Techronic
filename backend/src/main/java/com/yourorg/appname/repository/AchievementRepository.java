package com.yourorg.appname.repository;

import com.yourorg.appname.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {

    List<Achievement> findByUserIdOrderByUnlockedAtDesc(Long userId);

    boolean existsByUserIdAndBadgeCode(Long userId, String badgeCode);
}
