-- ============================================================================
-- CodeArena MySQL Database Schema
-- Converted from Firebase Firestore to Relational MySQL Database
-- Date: December 10, 2025
-- 
-- IMPORTANT: This script is IDEMPOTENT (safe to run multiple times)
-- It includes DROP statements to remove existing objects before creating new ones
-- ============================================================================

-- ============================================================================
-- DATABASE SETUP (Safe to run multiple times)
-- ============================================================================

-- Drop database if exists and create fresh
DROP DATABASE IF EXISTS codearena;
CREATE DATABASE codearena 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;
USE codearena;

-- ============================================================================
-- DROP EXISTING TABLES (for clean installation)
-- ============================================================================

DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS test_cases;
DROP TABLE IF EXISTS problems;
DROP TABLE IF EXISTS contest_participants;
DROP TABLE IF EXISTS contests;
DROP TABLE IF EXISTS user_activities;
DROP TABLE IF EXISTS users;

-- ============================================================================
-- TABLE: users
-- Description: Stores user account information and statistics
-- ============================================================================
CREATE TABLE users (
    user_id VARCHAR(128) PRIMARY KEY COMMENT 'Unique user identifier (Firebase UID compatible)',
    username VARCHAR(20) NOT NULL UNIQUE COMMENT 'Unique username for display',
    fullname VARCHAR(50) NOT NULL COMMENT 'User full name',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'User email address',
    photo_url VARCHAR(512) DEFAULT NULL COMMENT 'URL to user profile picture',
    is_admin BOOLEAN DEFAULT FALSE COMMENT 'Admin privileges flag',
    
    -- User Statistics
    problems_solved INT DEFAULT 0 COMMENT 'Total problems solved',
    total_points INT DEFAULT 0 COMMENT 'Total points earned',
    total_submissions INT DEFAULT 0 COMMENT 'Total submission count',
    contests_participated INT DEFAULT 0 COMMENT 'Number of contests participated',
    
    -- Problem difficulty breakdown
    easy_problems_solved INT DEFAULT 0 COMMENT 'Easy problems solved',
    medium_problems_solved INT DEFAULT 0 COMMENT 'Medium problems solved',
    hard_problems_solved INT DEFAULT 0 COMMENT 'Hard problems solved',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    
    -- Indexes for performance
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_problems_solved (problems_solved DESC),
    INDEX idx_total_points (total_points DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User accounts and statistics';

-- ============================================================================
-- TABLE: contests
-- Description: Stores programming contest information
-- ============================================================================
CREATE TABLE contests (
    contest_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique contest identifier',
    title VARCHAR(255) NOT NULL COMMENT 'Contest title',
    description TEXT NOT NULL COMMENT 'Contest description',
    start_time DATETIME NOT NULL COMMENT 'Contest start date and time',
    end_time DATETIME NOT NULL COMMENT 'Contest end date and time',
    problem_count INT DEFAULT 0 COMMENT 'Number of problems in contest',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Contest creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    
    -- Constraints
    CONSTRAINT chk_contest_time CHECK (end_time > start_time),
    
    -- Indexes
    INDEX idx_start_time (start_time DESC),
    INDEX idx_end_time (end_time),
    INDEX idx_contest_status (start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Programming contests';

-- ============================================================================
-- TABLE: problems
-- Description: Stores coding problem details
-- ============================================================================
CREATE TABLE problems (
    problem_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique problem identifier',
    contest_id INT NOT NULL COMMENT 'Associated contest ID',
    title VARCHAR(255) NOT NULL COMMENT 'Problem title',
    description TEXT NOT NULL COMMENT 'Problem description/statement',
    
    -- Problem metadata
    difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL DEFAULT 'Medium' COMMENT 'Problem difficulty level',
    points INT NOT NULL DEFAULT 100 COMMENT 'Points awarded for solving',
    time_limit INT NOT NULL DEFAULT 1000 COMMENT 'Time limit in milliseconds',
    memory_limit INT NOT NULL DEFAULT 256 COMMENT 'Memory limit in MB',
    
    -- Problem specifications
    constraints TEXT COMMENT 'Problem constraints',
    input_format TEXT COMMENT 'Input format description',
    output_format TEXT COMMENT 'Output format description',
    sample_input TEXT COMMENT 'Sample input for testing',
    sample_output TEXT COMMENT 'Sample expected output',
    
    -- Statistics
    total_submissions INT DEFAULT 0 COMMENT 'Total submission count',
    accepted_submissions INT DEFAULT 0 COMMENT 'Accepted submission count',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Problem creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    
    -- Foreign key
    FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_contest_id (contest_id),
    INDEX idx_difficulty (difficulty),
    INDEX idx_points (points),
    INDEX idx_acceptance_rate (accepted_submissions, total_submissions)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Coding problems';

-- ============================================================================
-- TABLE: test_cases
-- Description: Stores test cases for problems
-- ============================================================================
CREATE TABLE test_cases (
    test_case_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique test case identifier',
    problem_id INT NOT NULL COMMENT 'Associated problem ID',
    input_data TEXT NOT NULL COMMENT 'Test case input',
    expected_output TEXT NOT NULL COMMENT 'Expected output',
    is_hidden BOOLEAN DEFAULT FALSE COMMENT 'Hidden test case flag',
    test_order INT NOT NULL DEFAULT 0 COMMENT 'Display order of test case',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Test case creation timestamp',
    
    -- Foreign key
    FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_problem_id (problem_id),
    INDEX idx_problem_order (problem_id, test_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Test cases for problems';

-- ============================================================================
-- TABLE: submissions
-- Description: Stores user code submissions
-- ============================================================================
CREATE TABLE submissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique submission identifier',
    user_id VARCHAR(128) NOT NULL COMMENT 'User who submitted',
    problem_id INT NOT NULL COMMENT 'Problem submitted for',
    contest_id INT DEFAULT NULL COMMENT 'Contest context (NULL for practice)',
    
    -- Submission details
    code TEXT NOT NULL COMMENT 'Submitted source code',
    language VARCHAR(20) NOT NULL COMMENT 'Programming language used',
    status ENUM('Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compilation Error') NOT NULL COMMENT 'Submission verdict',
    
    -- Test results
    passed_tests INT NOT NULL DEFAULT 0 COMMENT 'Number of tests passed',
    total_tests INT NOT NULL COMMENT 'Total number of tests',
    points_earned INT DEFAULT 0 COMMENT 'Points earned from submission',
    
    -- Metadata
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Submission timestamp',
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE,
    FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_problem_id (problem_id),
    INDEX idx_contest_id (contest_id),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at DESC),
    INDEX idx_user_problem (user_id, problem_id),
    INDEX idx_user_contest (user_id, contest_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User code submissions';

-- ============================================================================
-- TABLE: contest_participants
-- Description: Tracks user participation in contests (many-to-many)
-- ============================================================================
CREATE TABLE contest_participants (
    participation_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique participation record',
    user_id VARCHAR(128) NOT NULL COMMENT 'Participating user',
    contest_id INT NOT NULL COMMENT 'Contest participated in',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Participation start timestamp',
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate entries
    UNIQUE KEY unique_participation (user_id, contest_id),
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_contest_id (contest_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Contest participation tracking';

-- ============================================================================
-- TABLE: user_activities
-- Description: Stores recent user activities (for activity feed)
-- ============================================================================
CREATE TABLE user_activities (
    activity_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique activity identifier',
    user_id VARCHAR(128) NOT NULL COMMENT 'User who performed activity',
    problem_id INT NOT NULL COMMENT 'Problem related to activity',
    contest_id INT DEFAULT NULL COMMENT 'Contest context (NULL for practice)',
    problem_title VARCHAR(255) NOT NULL COMMENT 'Problem title snapshot',
    contest_title VARCHAR(255) DEFAULT 'Practice' COMMENT 'Contest title or Practice',
    status VARCHAR(50) NOT NULL COMMENT 'Submission status',
    difficulty VARCHAR(20) COMMENT 'Problem difficulty',
    passed_tests INT DEFAULT 0 COMMENT 'Tests passed',
    total_tests INT DEFAULT 0 COMMENT 'Total tests',
    activity_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Activity timestamp',
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (problem_id) REFERENCES problems(problem_id) ON DELETE CASCADE,
    FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_user_timestamp (user_id, activity_timestamp DESC),
    INDEX idx_activity_timestamp (activity_timestamp DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User activity history (limited to recent 10 per user)';

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Contest status with live/upcoming/ended classification
CREATE OR REPLACE VIEW contest_status_view AS
SELECT 
    c.*,
    CASE 
        WHEN NOW() < c.start_time THEN 'upcoming'
        WHEN NOW() BETWEEN c.start_time AND c.end_time THEN 'active'
        ELSE 'ended'
    END AS status,
    COUNT(DISTINCT cp.user_id) AS participant_count
FROM contests c
LEFT JOIN contest_participants cp ON c.contest_id = cp.contest_id
GROUP BY c.contest_id;

-- View: Problem statistics with acceptance rate
CREATE OR REPLACE VIEW problem_stats_view AS
SELECT 
    p.*,
    c.title AS contest_title,
    c.start_time AS contest_start,
    c.end_time AS contest_end,
    CASE 
        WHEN p.total_submissions = 0 THEN 0
        ELSE ROUND((p.accepted_submissions * 100.0 / p.total_submissions), 2)
    END AS acceptance_rate,
    COUNT(DISTINCT tc.test_case_id) AS test_case_count
FROM problems p
JOIN contests c ON p.contest_id = c.contest_id
LEFT JOIN test_cases tc ON p.problem_id = tc.problem_id
GROUP BY p.problem_id;

-- View: User leaderboard
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    u.user_id,
    u.username,
    u.fullname,
    u.photo_url,
    u.problems_solved,
    u.total_points,
    u.contests_participated,
    u.easy_problems_solved,
    u.medium_problems_solved,
    u.hard_problems_solved,
    RANK() OVER (ORDER BY u.total_points DESC, u.problems_solved DESC) AS user_rank
FROM users u
ORDER BY user_rank;

-- View: User submission history with problem details
CREATE OR REPLACE VIEW submission_history_view AS
SELECT 
    s.submission_id,
    s.user_id,
    u.username,
    s.problem_id,
    p.title AS problem_title,
    p.difficulty,
    s.contest_id,
    COALESCE(c.title, 'Practice') AS contest_title,
    s.language,
    s.status,
    s.passed_tests,
    s.total_tests,
    s.points_earned,
    s.submitted_at
FROM submissions s
JOIN users u ON s.user_id = u.user_id
JOIN problems p ON s.problem_id = p.problem_id
LEFT JOIN contests c ON s.contest_id = c.contest_id
ORDER BY s.submitted_at DESC;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Drop existing procedures if they exist
DROP PROCEDURE IF EXISTS update_user_stats_after_submission;
DROP PROCEDURE IF EXISTS update_problem_stats_after_submission;
DROP PROCEDURE IF EXISTS add_user_activity;

-- Procedure: Update user statistics after submission
DELIMITER //

CREATE PROCEDURE update_user_stats_after_submission(
    IN p_user_id VARCHAR(128),
    IN p_problem_id INT,
    IN p_contest_id INT,
    IN p_is_accepted BOOLEAN,
    IN p_points INT,
    IN p_difficulty VARCHAR(20)
)
BEGIN
    DECLARE v_already_solved BOOLEAN DEFAULT FALSE;
    
    -- Check if user already solved this problem
    SELECT EXISTS(
        SELECT 1 FROM submissions 
        WHERE user_id = p_user_id 
        AND problem_id = p_problem_id 
        AND status = 'Accepted'
        AND submission_id != LAST_INSERT_ID()
    ) INTO v_already_solved;
    
    -- Update total submissions
    UPDATE users 
    SET total_submissions = total_submissions + 1
    WHERE user_id = p_user_id;
    
    -- If accepted and first time solving this problem
    IF p_is_accepted AND NOT v_already_solved THEN
        UPDATE users 
        SET 
            problems_solved = problems_solved + 1,
            total_points = total_points + p_points,
            easy_problems_solved = easy_problems_solved + IF(p_difficulty = 'Easy', 1, 0),
            medium_problems_solved = medium_problems_solved + IF(p_difficulty = 'Medium', 1, 0),
            hard_problems_solved = hard_problems_solved + IF(p_difficulty = 'Hard', 1, 0)
        WHERE user_id = p_user_id;
    END IF;
    
    -- Track contest participation
    IF p_contest_id IS NOT NULL THEN
        INSERT INTO contest_participants (user_id, contest_id)
        VALUES (p_user_id, p_contest_id)
        ON DUPLICATE KEY UPDATE joined_at = joined_at; -- Keep original join time
        
        -- Update contest participation count
        UPDATE users u
        SET contests_participated = (
            SELECT COUNT(DISTINCT contest_id) 
            FROM contest_participants 
            WHERE user_id = p_user_id
        )
        WHERE u.user_id = p_user_id;
    END IF;
END //

-- Procedure: Update problem statistics after submission
CREATE PROCEDURE update_problem_stats_after_submission(
    IN p_problem_id INT,
    IN p_is_accepted BOOLEAN
)
BEGIN
    UPDATE problems
    SET 
        total_submissions = total_submissions + 1,
        accepted_submissions = accepted_submissions + IF(p_is_accepted, 1, 0)
    WHERE problem_id = p_problem_id;
END //

-- Procedure: Add user activity
CREATE PROCEDURE add_user_activity(
    IN p_user_id VARCHAR(128),
    IN p_problem_id INT,
    IN p_contest_id INT,
    IN p_problem_title VARCHAR(255),
    IN p_contest_title VARCHAR(255),
    IN p_status VARCHAR(50),
    IN p_difficulty VARCHAR(20),
    IN p_passed_tests INT,
    IN p_total_tests INT
)
BEGIN
    -- Insert new activity
    INSERT INTO user_activities (
        user_id, problem_id, contest_id, problem_title, contest_title,
        status, difficulty, passed_tests, total_tests
    ) VALUES (
        p_user_id, p_problem_id, p_contest_id, p_problem_title, p_contest_title,
        p_status, p_difficulty, p_passed_tests, p_total_tests
    );
    
    -- Keep only last 10 activities per user
    DELETE FROM user_activities
    WHERE activity_id IN (
        SELECT activity_id FROM (
            SELECT activity_id
            FROM user_activities
            WHERE user_id = p_user_id
            ORDER BY activity_timestamp DESC
            LIMIT 10, 18446744073709551615
        ) AS old_activities
    );
END //

DELIMITER ;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS after_problem_insert;
DROP TRIGGER IF EXISTS after_problem_delete;
DROP TRIGGER IF EXISTS after_submission_insert;

-- Trigger: Auto-update contest problem count when problem is added
DELIMITER //

CREATE TRIGGER after_problem_insert
AFTER INSERT ON problems
FOR EACH ROW
BEGIN
    UPDATE contests
    SET problem_count = problem_count + 1
    WHERE contest_id = NEW.contest_id;
END //

-- Trigger: Auto-update contest problem count when problem is deleted
CREATE TRIGGER after_problem_delete
AFTER DELETE ON problems
FOR EACH ROW
BEGIN
    UPDATE contests
    SET problem_count = problem_count - 1
    WHERE contest_id = OLD.contest_id;
END //

-- Trigger: Auto-update statistics after submission insert
CREATE TRIGGER after_submission_insert
AFTER INSERT ON submissions
FOR EACH ROW
BEGIN
    DECLARE v_difficulty VARCHAR(20);
    DECLARE v_problem_title VARCHAR(255);
    DECLARE v_contest_title VARCHAR(255);
    
    -- Get problem details
    SELECT difficulty, title INTO v_difficulty, v_problem_title
    FROM problems
    WHERE problem_id = NEW.problem_id;
    
    -- Get contest title if applicable
    IF NEW.contest_id IS NOT NULL THEN
        SELECT title INTO v_contest_title
        FROM contests
        WHERE contest_id = NEW.contest_id;
    ELSE
        SET v_contest_title = 'Practice';
    END IF;
    
    -- Update user stats
    CALL update_user_stats_after_submission(
        NEW.user_id,
        NEW.problem_id,
        NEW.contest_id,
        NEW.status = 'Accepted',
        NEW.points_earned,
        v_difficulty
    );
    
    -- Update problem stats
    CALL update_problem_stats_after_submission(
        NEW.problem_id,
        NEW.status = 'Accepted'
    );
    
    -- Add user activity
    CALL add_user_activity(
        NEW.user_id,
        NEW.problem_id,
        NEW.contest_id,
        v_problem_title,
        v_contest_title,
        NEW.status,
        v_difficulty,
        NEW.passed_tests,
        NEW.total_tests
    );
END //

DELIMITER ;

-- ============================================================================
-- INDEXES FOR OPTIMIZATION
-- ============================================================================

-- Note: Indexes are automatically recreated when tables are dropped/recreated
-- No need to drop them separately since we already drop tables at the beginning

-- Additional composite indexes for common query patterns
CREATE INDEX idx_user_contest_performance ON submissions(user_id, contest_id, status, points_earned);
CREATE INDEX idx_problem_difficulty_stats ON problems(difficulty, accepted_submissions, total_submissions);
CREATE INDEX idx_contest_date_range ON contests(start_time, end_time);

-- ============================================================================
-- SAMPLE DATA INSERTION (Optional - for testing)
-- ============================================================================

-- Clear existing sample data if present
DELETE FROM users WHERE user_id IN ('admin_123456', 'user_001', 'user_002');

-- Insert sample admin user
INSERT INTO users (user_id, username, fullname, email, is_admin) VALUES
('admin_123456', 'admin', 'System Administrator', 'admin@codearena.com', TRUE);

-- Insert sample regular users
INSERT INTO users (user_id, username, fullname, email) VALUES
('user_001', 'john_doe', 'John Doe', 'john@example.com'),
('user_002', 'jane_smith', 'Jane Smith', 'jane@example.com');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
