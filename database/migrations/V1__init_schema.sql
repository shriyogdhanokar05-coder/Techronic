-- ==========================================================
-- TECHRONICS CYBER TIC-TAC-TOE SCHEMA DEFINITION (MSSQL)
-- Migration: V1__init_schema.sql
-- ==========================================================

-- 1. USERS TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL UNIQUE,
        email NVARCHAR(100) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        gamer_tag NVARCHAR(50) NOT NULL,
        role NVARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
        rank_division NVARCHAR(50) NOT NULL DEFAULT 'DIAMOND III',
        combat_rating INT NOT NULL DEFAULT 2450,
        level INT NOT NULL DEFAULT 42,
        current_xp INT NOT NULL DEFAULT 8450,
        victories INT NOT NULL DEFAULT 342,
        defeats INT NOT NULL DEFAULT 118,
        draws INT NOT NULL DEFAULT 45,
        win_streak INT NOT NULL DEFAULT 7,
        avatar_url NVARCHAR(1000) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );

    CREATE INDEX idx_users_username ON users(username);
    CREATE INDEX idx_users_cr ON users(combat_rating DESC);
END;

-- 2. MATCHES TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'matches')
BEGIN
    CREATE TABLE matches (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        room_code NVARCHAR(20) NULL,
        player1_id BIGINT NOT NULL,
        player2_id BIGINT NULL,
        player1_tag NVARCHAR(50) NOT NULL,
        player2_tag NVARCHAR(50) NOT NULL,
        winner_id BIGINT NULL,
        result_type NVARCHAR(20) NOT NULL, -- 'WIN', 'LOSS', 'DRAW', 'IN_PROGRESS'
        player1_score INT NOT NULL DEFAULT 0,
        player2_score INT NOT NULL DEFAULT 0,
        game_mode NVARCHAR(30) NOT NULL,   -- 'ONLINE_RANKED', 'QUICK_MATCH', 'VS_AI', 'HOTSEAT'
        ai_difficulty NVARCHAR(20) NULL,   -- 'EASY', 'MEDIUM', 'HARD', 'EXPERT'
        cr_change INT NOT NULL DEFAULT 0,
        xp_earned INT NOT NULL DEFAULT 0,
        board_state NVARCHAR(2000) NULL,
        duration_seconds INT NOT NULL DEFAULT 0,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_matches_player1 FOREIGN KEY (player1_id) REFERENCES users(id),
        CONSTRAINT fk_matches_player2 FOREIGN KEY (player2_id) REFERENCES users(id),
        CONSTRAINT fk_matches_winner FOREIGN KEY (winner_id) REFERENCES users(id)
    );

    CREATE INDEX idx_matches_player1 ON matches(player1_id);
    CREATE INDEX idx_matches_created ON matches(created_at DESC);
END;

-- 3. QUESTS TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'quests')
BEGIN
    CREATE TABLE quests (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        user_id BIGINT NULL,
        title NVARCHAR(100) NOT NULL,
        description NVARCHAR(255) NOT NULL,
        reward_xp INT NOT NULL DEFAULT 150,
        target_count INT NOT NULL DEFAULT 1,
        current_count INT NOT NULL DEFAULT 0,
        completed BIT NOT NULL DEFAULT 0,
        reset_time NVARCHAR(50) NULL,
        CONSTRAINT fk_quests_user FOREIGN KEY (user_id) REFERENCES users(id)
    );
END;

-- 4. ACHIEVEMENTS TABLE
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'achievements')
BEGIN
    CREATE TABLE achievements (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        user_id BIGINT NOT NULL,
        badge_code NVARCHAR(50) NOT NULL,
        title NVARCHAR(100) NOT NULL,
        description NVARCHAR(255) NOT NULL,
        unlocked_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT fk_achievements_user FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX idx_achievements_user ON achievements(user_id);
END;
