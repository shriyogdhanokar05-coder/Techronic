package com.yourorg.appname.repository;

import com.yourorg.appname.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<User> findTop100ByOrderByCombatRatingDesc();

    @Query("SELECT u FROM User u WHERE " +
           "(:division IS NULL OR :division = 'ALL' OR UPPER(u.rankDivision) LIKE UPPER(CONCAT('%', :division, '%'))) AND " +
           "(:search IS NULL OR UPPER(u.gamerTag) LIKE UPPER(CONCAT('%', :search, '%')) OR UPPER(u.username) LIKE UPPER(CONCAT('%', :search, '%'))) " +
           "ORDER BY u.combatRating DESC")
    Page<User> findLeaderboard(@Param("division") String division, @Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(u) + 1 FROM User u WHERE u.combatRating > :cr")
    Long findRankByCombatRating(@Param("cr") Integer cr);
}
