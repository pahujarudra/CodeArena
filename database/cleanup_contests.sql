-- Cleanup Duplicate Contests
-- Keep: Contest 10 (Weekly Contest), 11 (Monthly Challenge), 12 (Beginner Bootcamp), 13 (Add the numbers)
-- Delete: Contests 1-9 (duplicates)

USE codearena;

-- Show what will be deleted
SELECT 'Contests to be DELETED:' as Info;
SELECT contest_id, title FROM contests WHERE contest_id IN (1,2,3,4,5,6,7,8,9);

SELECT 'Contests to be KEPT:' as Info;
SELECT contest_id, title FROM contests WHERE contest_id IN (10,11,12,13);

-- Delete duplicate contests (this will cascade delete all related problems, test cases, submissions)
DELETE FROM contests WHERE contest_id IN (1,2,3,4,5,6,7,8,9);

-- Show remaining contests
SELECT 'Remaining Contests:' as Result;
SELECT contest_id, title, 
       (SELECT COUNT(*) FROM problems WHERE contest_id = c.contest_id) as problem_count
FROM contests c 
ORDER BY contest_id;

COMMIT;
