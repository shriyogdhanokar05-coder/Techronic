package com.yourorg.appname.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_code", length = 20)
    private String roomCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player1_id", nullable = false)
    private User player1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player2_id")
    private User player2;

    @Column(name = "player1_tag", nullable = false, length = 50)
    private String player1Tag;

    @Column(name = "player2_tag", nullable = false, length = 50)
    private String player2Tag;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    private User winner;

    @Column(name = "result_type", nullable = false, length = 20)
    private String resultType; // 'WIN', 'LOSS', 'DRAW', 'IN_PROGRESS'

    @Column(name = "player1_score", nullable = false)
    @Builder.Default
    private Integer player1Score = 0;

    @Column(name = "player2_score", nullable = false)
    @Builder.Default
    private Integer player2Score = 0;

    @Column(name = "game_mode", nullable = false, length = 30)
    private String gameMode; // 'ONLINE_RANKED', 'QUICK_MATCH', 'VS_AI', 'HOTSEAT'

    @Column(name = "ai_difficulty", length = 20)
    private String aiDifficulty; // 'EASY', 'MEDIUM', 'HARD', 'EXPERT'

    @Column(name = "cr_change", nullable = false)
    @Builder.Default
    private Integer crChange = 0;

    @Column(name = "xp_earned", nullable = false)
    @Builder.Default
    private Integer xpEarned = 0;

    @Column(name = "board_state", length = 2000)
    private String boardState;

    @Column(name = "duration_seconds", nullable = false)
    @Builder.Default
    private Integer durationSeconds = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
