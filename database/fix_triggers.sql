-- Fix stored procedures and triggers for user statistics
-- This script creates corrected procedures and triggers that match the actual table structure

-- Drop existing procedures and triggers
DROP PROCEDURE IF EXISTS update_user_stats_after_submission;
DROP PROCEDURE IF EXISTS update_problem_stats_after_submission;
DROP PROCEDURE IF EXISTS add_user_activity;
DROP TRIGGER IF EXISTS after_problem_insert;
DROP TRIGGER IF EXISTS after_problem_delete;
DROP TRIGGER IF EXISTS after_submission_insert;

DELIMITER //

-- Procedure: Update user statistics after submission
CREATE PROCEDURE update_user_stats_after_submission(
    IN p_user_id INT,
    IN p_problem_id INT,
    IN p_is_accepted BOOLEAN,
    IN p_score INT
)
BEGIN
    DECLARE v_already_solved INT DEFAULT 0;
    
    -- Check if user already solved this problem (count accepted submissions including current one)
    SELECT COUNT(*) INTO v_already_solved
    FROM submissions 
    WHERE user_id = p_user_id 
    AND problem_id = p_problem_id 
    AND status = 'Accepted';
    
    -- Update total submissions (always increment)
    UPDATE users 
    SET total_submissions = total_submissions + 1
    WHERE user_id = p_user_id;
    
    -- If accepted and first time solving this problem (count will be 1)
    IF p_is_accepted AND v_already_solved = 1 THEN
        UPDATE users 
        SET 
            total_solved = total_solved + 1,
            rating = rating + p_score
        WHERE user_id = p_user_id;
    END IF;
END //

-- Procedure: Update problem statistics after submission
CREATE PROCEDURE update_problem_stats_after_submission(
    IN p_problem_id INT,
    IN p_is_accepted BOOLEAN
)
BEGIN
    DECLARE v_total INT DEFAULT 0;
    DECLARE v_accepted INT DEFAULT 0;
    DECLARE v_acceptance_rate DECIMAL(5,2);
    
    -- Count total submissions for this problem
    SELECT COUNT(*) INTO v_total
    FROM submissions
    WHERE problem_id = p_problem_id;
    
    -- Count accepted submissions
    SELECT COUNT(*) INTO v_accepted
    FROM submissions
    WHERE problem_id = p_problem_id AND status = 'Accepted';
    
    -- Calculate acceptance rate
    IF v_total > 0 THEN
        SET v_acceptance_rate = (v_accepted * 100.0) / v_total;
    ELSE
        SET v_acceptance_rate = 0;
    END IF;
    
    -- Update problem statistics
    UPDATE problems
    SET 
        total_submissions = v_total,
        acceptance_rate = FORMAT(v_acceptance_rate, 2)
    WHERE problem_id = p_problem_id;
END //

-- Procedure: Add user activity
CREATE PROCEDURE add_user_activity(
    IN p_user_id INT,
    IN p_problem_id INT,
    IN p_problem_title VARCHAR(255),
    IN p_status VARCHAR(50),
    IN p_difficulty VARCHAR(20),
    IN p_score INT
)
BEGIN
    DECLARE v_description TEXT;
    DECLARE v_activity_type VARCHAR(50);
    
    -- Create activity description
    IF p_status = 'Accepted' THEN
        SET v_activity_type = 'solved_problem';
        SET v_description = CONCAT('Solved "', p_problem_title, '" (', p_difficulty, ') - Score: ', p_score);
    ELSE
        SET v_activity_type = 'attempted_problem';
        SET v_description = CONCAT('Attempted "', p_problem_title, '" (', p_difficulty, ') - ', p_status);
    END IF;
    
    -- Insert new activity
    INSERT INTO user_activities (
        user_id, activity_type, description
    ) VALUES (
        p_user_id, v_activity_type, v_description
    );
    
    -- Keep only last 10 activities per user
    DELETE FROM user_activities
    WHERE user_id = p_user_id
    AND activity_id NOT IN (
        SELECT activity_id FROM (
            SELECT activity_id
            FROM user_activities
            WHERE user_id = p_user_id
            ORDER BY activity_timestamp DESC
            LIMIT 10
        ) AS keep_activities
    );
END //

DELIMITER ;

-- Create Triggers

DELIMITER //

-- Trigger: Auto-update contest problem count when problem is added
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
    
    -- Get problem details
    SELECT difficulty, title INTO v_difficulty, v_problem_title
    FROM problems
    WHERE problem_id = NEW.problem_id;
    
    -- Update user stats
    CALL update_user_stats_after_submission(
        NEW.user_id,
        NEW.problem_id,
        NEW.status = 'Accepted',
        NEW.score
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
        v_problem_title,
        NEW.status,
        v_difficulty,
        NEW.score
    );
END //

DELIMITER ;

-- Display confirmation
SELECT 'Stored procedures and triggers created successfully!' AS Status;
SHOW PROCEDURE STATUS WHERE Db = 'codearena';
SHOW TRIGGERS FROM codearena;
