-- ==========================================================
-- TECHRONICS CYBER SEED DATA (MSSQL)
-- Migration: V2__seed_data.sql
-- ==========================================================

-- Standard BCrypt hash for 'password123': $2a$10$wT8Kz1uC7zHkOQ9f1M1k7uB7V2kP3zN4s9T8uV7wX6yZ5aB4cD3eF
-- We will insert initial players matching the Stitch designs:
-- 1. CYBER_VIPER (Primary user portrayed in UI)
-- 2. NEXUS_PRIME (#1 Apex Grandmaster)
-- 3. GLITCH_QUEEN (#2 Silver Crown)
-- 4. CYBER_PHANTOM (#3 Bronze Cyber)
-- 5. VORTEX_99 (Rival featured in Live Arena)
-- 6. VALKYRIE_01 (Fireteam 09 squadmate)
-- 7. CHRONO_KID (Fireteam 09 squadmate)
-- 8. NEXUS_GHOST (Fireteam 09 squadmate)

IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'viper')
BEGIN
    INSERT INTO users (username, email, password_hash, gamer_tag, role, rank_division, combat_rating, level, current_xp, victories, defeats, draws, win_streak, avatar_url)
    VALUES 
    ('viper', 'viper@techronics.gg', '$2a$10$r8N7hY64tU9kL2m1p0q7Xe9y8u7v6w5x4y3z2a1b0c9d8e7f6g5h', 'CYBER_VIPER', 'ROLE_USER', 'DIAMOND III', 2450, 42, 8450, 342, 118, 45, 7, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSXqdyHnS9BuGphkoQl7oUuxJNABrjK_Pa54SRVoJkBZ826RhOH7NZ4C2f_XfosMQHQ6EP3CPvRzKmdQVcgSsSWoIh9igN4BMQfihmx83lmDdOAIFqkmG9_X-IedcDxX_FsG5PXXuMmsnhIbkbHxEnaTTLBY4w5v6s2HZctqhrzhcBZpykxR6ZbvVh5fChGqlJIvreZhf0LB6wSYlUfj5AtA28tGweQ3ED33jmYzxKEY-cx0Y_kYDweQ'),
    ('nexus', 'nexus@techronics.gg', '$2a$10$r8N7hY64tU9kL2m1p0q7Xe9y8u7v6w5x4y3z2a1b0c9d8e7f6g5h', 'NEXUS_PRIME', 'ROLE_USER', 'GRANDMASTER', 3120, 58, 9200, 520, 68, 30, 14, 'https://lh3.googleusercontent.com/aida/AEtjO1XUan5Ffk3FawSQDwTewKBqVm82wK3i_BFHm2D0JQ2Qk8P8_AP1EA3sITSuUr-MmD_Himw6Zi6r_OMSZXFYAB4HnMPVNX-ifE6XEJBUuImUfyBtLGebM6CtapuI8h7FW1Ad5142n-T16Vx6BesBdBgM-KsSM59b1_4SR4PHZWh2mmIXOfITshoScXSphP64N4rTr0AO1F65x9T9fVInh5MbxVnvCu8hIoenKlD6PJDGJF1RxHvRgr2G6k4P'),
    ('glitch', 'glitch@techronics.gg', '$2a$10$r8N7hY64tU9kL2m1p0q7Xe9y8u7v6w5x4y3z2a1b0c9d8e7f6g5h', 'GLITCH_QUEEN', 'ROLE_USER', 'GRANDMASTER', 2980, 51, 6100, 480, 85, 22, 9, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOSaESbB5KiDfmUc4QqLFYjviXw5X62xwWrqtkH-a6aSjl-RQVbj3g69udj9j_3uoZVWOuyEsURVXLvrYAUIMnuMeu4n2N8WcdW4AJCgcy54NFhbV9cp62-xWWWrtEip_9SAdHXlb1Ytks_PzFyzy9hdM58F0FUxfZAt-0e_ksWnrwewtdz0v1f-yxHU0sDLKC_YPgeaF9HAZfWAqf1i70cNHqcHPNKBE9m8T3w7t9NHoNjnr47iylNA'),
    ('phantom', 'phantom@techronics.gg', '$2a$10$r8N7hY64tU9kL2m1p0q7Xe9y8u7v6w5x4y3z2a1b0c9d8e7f6g5h', 'CYBER_PHANTOM', 'ROLE_USER', 'MASTER', 2740, 46, 4200, 410, 110, 35, 5, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPjpcbljMZPeD6b_13RKUif_lG9d_MSdGLUF3jtTRUtQEkVgreKkzegW1jNITRM_TZBZYX4YoFqoPqGZax51uh4ThFt1RyogtM7TjOtVbB28ToeBqSELG7uVKPNgeZspuFINjaS5q_SNCjG8VSnaaVbTRULtIcWNI1lfDPsLdQ5CWkI5WJ5I3ANS_17OaNyUnW2Zm-AiIMKQm46MIqfQC3RovrQ5t1d05cWyRvdfpXg9WDxcVclPTvcg'),
    ('vortex', 'vortex@techronics.gg', '$2a$10$r8N7hY64tU9kL2m1p0q7Xe9y8u7v6w5x4y3z2a1b0c9d8e7f6g5h', 'VORTEX_99', 'ROLE_USER', 'TITAN II', 2410, 39, 7800, 310, 140, 50, 2, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPjpcbljMZPeD6b_13RKUif_lG9d_MSdGLUF3jtTRUtQEkVgreKkzegW1jNITRM_TZBZYX4YoFqoPqGZax51uh4ThFt1RyogtM7TjOtVbB28ToeBqSELG7uVKPNgeZspuFINjaS5q_SNCjG8VSnaaVbTRULtIcWNI1lfDPsLdQ5CWkI5WJ5I3ANS_17OaNyUnW2Zm-AiIMKQm46MIqfQC3RovrQ5t1d05cWyRvdfpXg9WDxcVclPTvcg'),
    ('valkyrie', 'valkyrie@techronics.gg', '$2a$10$r8N7hY64tU9kL2m1p0q7Xe9y8u7v6w5x4y3z2a1b0c9d8e7f6g5h', 'VALKYRIE_01', 'ROLE_USER', 'DIAMOND I', 2320, 35, 3400, 280, 130, 40, 4, null),
    ('chrono', 'chrono@techronics.gg', '$2a$10$r8N7hY64tU9kL2m1p0q7Xe9y8u7v6w5x4y3z2a1b0c9d8e7f6g5h', 'CHRONO_KID', 'ROLE_USER', 'PLATINUM II', 1980, 28, 5100, 210, 150, 30, 3, null);
END;

-- Seed Tactical Bounties / Quests
IF NOT EXISTS (SELECT 1 FROM quests)
BEGIN
    INSERT INTO quests (user_id, title, description, reward_xp, target_count, current_count, completed, reset_time)
    VALUES
    (1, 'Cyber Matrix Dominance', 'Achieve 3 Ranked Victories in Online Multiplayer', 450, 3, 2, 0, '04H 21M'),
    (1, 'Corner Flank Stratagem', 'Claim 4 corner sectors in Live Arena duels', 300, 4, 3, 0, '04H 21M'),
    (1, 'Neural Hunter', 'Defeat Expert Neural AI without conceding any marks', 600, 1, 0, 0, '04H 21M');
END;

-- Seed Sample Recent Matches
IF NOT EXISTS (SELECT 1 FROM matches)
BEGIN
    INSERT INTO matches (room_code, player1_id, player2_id, player1_tag, player2_tag, winner_id, result_type, player1_score, player2_score, game_mode, ai_difficulty, cr_change, xp_earned, board_state, duration_seconds)
    VALUES
    ('TX-8849', 1, 5, 'CYBER_VIPER', 'VORTEX_99', 1, 'WIN', 2, 1, 'ONLINE_RANKED', NULL, 24, 185, 'X,O,X,O,X,O,X,,', 142),
    ('TX-7712', 1, 4, 'CYBER_VIPER', 'CYBER_PHANTOM', 1, 'WIN', 3, 1, 'ONLINE_RANKED', NULL, 18, 150, 'X,X,X,O,O,,,', 98),
    ('TX-6623', 1, NULL, 'CYBER_VIPER', 'NEURAL_AI_EXPERT', 1, 'WIN', 1, 0, 'VS_AI', 'EXPERT', 0, 120, 'X,O,X,,X,,O,O,X', 75);
END;

-- Seed Achievements
IF NOT EXISTS (SELECT 1 FROM achievements)
BEGIN
    INSERT INTO achievements (user_id, badge_code, title, description)
    VALUES
    (1, 'TACTICAL_MASTER_2', 'TACTICAL MASTER (Stage II)', '5 Consecutive Precision Wins Achieved'),
    (1, 'CYBER_REAPER', 'CYBER REAPER', 'Reach Diamond Division in Competitive Ranked'),
    (1, 'NEURAL_BREAKER', 'NEURAL BREAKER', 'Defeat Expert Neural Bot 10 Times');
END;
