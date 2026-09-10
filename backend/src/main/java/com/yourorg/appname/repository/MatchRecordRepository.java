package com.yourorg.appname.repository;

import com.yourorg.appname.entity.MatchRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRecordRepository extends JpaRepository<MatchRecord, Long> {

    @Query("SELECT m FROM MatchRecord m WHERE m.player1.id = :userId OR m.player2.id = :userId ORDER BY m.createdAt DESC")
    List<MatchRecord> findRecentMatchesByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT m FROM MatchRecord m WHERE m.player1.id = :userId OR m.player2.id = :userId ORDER BY m.createdAt DESC")
    Page<MatchRecord> findAllMatchesByUserId(@Param("userId") Long userId, Pageable pageable);

    Optional<MatchRecord> findTopByPlayer1IdOrPlayer2IdOrderByCreatedAtDesc(Long player1Id, Long player2Id);

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM MatchRecord m WHERE m.player1.id = :userId OR m.player2.id = :userId OR m.winner.id = :userId")
    void deleteMatchesByUserId(@Param("userId") Long userId);
}

