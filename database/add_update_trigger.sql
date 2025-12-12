-- Add UPDATE trigger for submissions to handle status changes
-- This trigger fires when submission status is updated from Pending to Accepted/Wrong Answer/etc.

DROP TRIGGER IF EXISTS after_submission_update;

DELIMITER //

CREATE TRIGGER after_submission_update
AFTER UPDATE ON submissions
FOR EACH ROW
BEGIN
    DECLARE v_difficulty VARCHAR(20);
    DECLARE v_problem_title VARCHAR(255);
    
    -- Only process if status changed from Pending to something else
    IF OLD.status = 'Pending' AND NEW.status != 'Pending' THEN
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
    END IF;
END //

DELIMITER ;

SELECT 'Update trigger created successfully!' AS Status;
SHOW TRIGGERS FROM codearena WHERE `Trigger` LIKE '%submission%';
