# CodeArena Database - Installation & Testing Guide

## 🚀 Quick Start Installation

### Prerequisites

Before you begin, ensure you have:

- ✅ MySQL 8.0 or higher installed
- ✅ MySQL Workbench (optional, for GUI)
- ✅ Terminal/Command Line access
- ✅ Basic SQL knowledge

---

## 📥 Installation Steps

### Option 1: Command Line Installation (Recommended)

```bash
# Step 1: Login to MySQL
mysql -u root -p

# Step 2: Create database
CREATE DATABASE codearena;
USE codearena;

# Step 3: Run the schema file
SOURCE /path/to/CodeArena/database/mysql_schema.sql;

# Step 4: Verify installation
SHOW TABLES;

# Expected output:
# +---------------------+
# | Tables_in_codearena |
# +---------------------+
# | contest_participants|
# | contests            |
# | problems            |
# | submissions         |
# | test_cases          |
# | user_activities     |
# | users               |
# +---------------------+
```

### Option 2: MySQL Workbench Installation

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Click **File → Open SQL Script**
4. Navigate to `/CodeArena/database/mysql_schema.sql`
5. Click the lightning bolt icon (⚡) to execute
6. Verify tables in the left sidebar under "codearena" database

---

## ✅ Verification Tests

### Test 1: Check Tables

```sql
-- Show all tables
SHOW TABLES;

-- Expected: 7 tables
```

### Test 2: Check Views

```sql
-- Show all views
SELECT TABLE_NAME
FROM information_schema.VIEWS
WHERE TABLE_SCHEMA = 'codearena';

-- Expected: 4 views
-- - contest_status_view
-- - problem_stats_view
-- - leaderboard_view
-- - submission_history_view
```

### Test 3: Check Triggers

```sql
-- Show all triggers
SHOW TRIGGERS WHERE `Database` = 'codearena';

-- Expected: 3 triggers
-- - after_problem_insert
-- - after_problem_delete
-- - after_submission_insert
```

### Test 4: Check Stored Procedures

```sql
-- Show all procedures
SHOW PROCEDURE STATUS WHERE Db = 'codearena';

-- Expected: 3 procedures
-- - update_user_stats_after_submission
-- - update_problem_stats_after_submission
-- - add_user_activity
```

### Test 5: Check Sample Data

```sql
-- Check sample users
SELECT user_id, username, fullname FROM users;

-- Expected: At least 3 users (admin + 2 test users)
```

---

## 🧪 Functional Testing

### Test Scenario 1: User Registration

```sql
-- Insert new user
INSERT INTO users (
    user_id, username, fullname, email
) VALUES (
    'test_001', 'testuser1', 'Test User One', 'test1@example.com'
);

-- Verify insertion
SELECT * FROM users WHERE user_id = 'test_001';

-- Expected: New user record with default stats (0)
```

### Test Scenario 2: Create Contest

```sql
-- Create a new contest
INSERT INTO contests (
    title,
    description,
    start_time,
    end_time
) VALUES (
    'Test Contest 1',
    'A test contest for verification',
    '2025-12-20 10:00:00',
    '2025-12-20 12:00:00'
);

-- Get the contest ID
SELECT LAST_INSERT_ID() as contest_id;

-- Verify contest
SELECT * FROM contests WHERE title = 'Test Contest 1';

-- Check contest status view
SELECT * FROM contest_status_view WHERE title = 'Test Contest 1';
```

### Test Scenario 3: Add Problem to Contest

```sql
-- Add problem (use contest_id from previous test)
INSERT INTO problems (
    contest_id,
    title,
    description,
    difficulty,
    points,
    time_limit,
    memory_limit,
    constraints,
    input_format,
    output_format,
    sample_input,
    sample_output
) VALUES (
    1,  -- Replace with actual contest_id
    'Test Problem: Two Sum',
    'Given an array of integers, return indices of two numbers that add up to target.',
    'Easy',
    100,
    1000,
    256,
    '2 <= nums.length <= 10^4',
    'First line: n (array size)\nSecond line: n integers\nThird line: target',
    'Two space-separated integers representing indices',
    '4\n2 7 11 15\n9',
    '0 1'
);

-- Get problem ID
SELECT LAST_INSERT_ID() as problem_id;

-- Verify problem count increased (trigger test)
SELECT problem_count FROM contests WHERE contest_id = 1;
-- Expected: problem_count = 1
```

### Test Scenario 4: Add Test Cases

```sql
-- Add visible test case
INSERT INTO test_cases (
    problem_id,
    input_data,
    expected_output,
    is_hidden,
    test_order
) VALUES (
    1,  -- Replace with actual problem_id
    '4\n2 7 11 15\n9',
    '0 1',
    FALSE,
    1
);

-- Add hidden test case
INSERT INTO test_cases (
    problem_id,
    input_data,
    expected_output,
    is_hidden,
    test_order
) VALUES (
    1,  -- Replace with actual problem_id
    '5\n1 2 3 4 5\n9',
    '3 4',
    TRUE,
    2
);

-- Verify test cases
SELECT * FROM test_cases WHERE problem_id = 1 ORDER BY test_order;
```

### Test Scenario 5: Submit Solution

```sql
-- Submit a solution
INSERT INTO submissions (
    user_id,
    problem_id,
    contest_id,
    code,
    language,
    status,
    passed_tests,
    total_tests,
    points_earned
) VALUES (
    'test_001',
    1,  -- problem_id
    1,  -- contest_id
    'class Solution { public int[] twoSum(int[] nums, int target) { ... } }',
    'java',
    'Accepted',
    2,
    2,
    100
);

-- Wait a moment for triggers to execute

-- Verify user stats updated (trigger test)
SELECT
    user_id,
    username,
    total_submissions,
    problems_solved,
    total_points,
    easy_problems_solved
FROM users
WHERE user_id = 'test_001';

-- Expected:
-- total_submissions = 1
-- problems_solved = 1
-- total_points = 100
-- easy_problems_solved = 1

-- Verify problem stats updated
SELECT
    problem_id,
    title,
    total_submissions,
    accepted_submissions
FROM problems
WHERE problem_id = 1;

-- Expected:
-- total_submissions = 1
-- accepted_submissions = 1

-- Verify activity added
SELECT * FROM user_activities
WHERE user_id = 'test_001'
ORDER BY activity_timestamp DESC
LIMIT 1;

-- Expected: 1 activity record with problem details
```

### Test Scenario 6: Contest Participation Tracking

```sql
-- Check if contest participation was tracked
SELECT * FROM contest_participants
WHERE user_id = 'test_001' AND contest_id = 1;

-- Expected: 1 record

-- Verify user's contests_participated count
SELECT contests_participated FROM users WHERE user_id = 'test_001';

-- Expected: 1
```

### Test Scenario 7: Leaderboard View

```sql
-- Check leaderboard
SELECT * FROM leaderboard_view LIMIT 10;

-- Verify ranking
SELECT
    username,
    problems_solved,
    total_points,
    user_rank
FROM leaderboard_view
WHERE username = 'testuser1';

-- Expected: testuser1 appears with rank based on points
```

### Test Scenario 8: Problem Statistics View

```sql
-- Check problem stats
SELECT * FROM problem_stats_view WHERE problem_id = 1;

-- Expected: Shows acceptance rate, test case count, etc.
```

### Test Scenario 9: Submission History View

```sql
-- Get user's submission history
SELECT * FROM submission_history_view
WHERE user_id = 'test_001'
ORDER BY submitted_at DESC;

-- Expected: Shows detailed submission with JOINed data
```

### Test Scenario 10: Delete Operations (Cascade Test)

```sql
-- Count test cases before deletion
SELECT COUNT(*) as test_case_count
FROM test_cases
WHERE problem_id = 1;

-- Delete problem (should cascade to test_cases)
DELETE FROM problems WHERE problem_id = 1;

-- Verify test cases deleted (cascade test)
SELECT COUNT(*) as test_case_count
FROM test_cases
WHERE problem_id = 1;

-- Expected: 0

-- Verify contest problem count decreased (trigger test)
SELECT problem_count FROM contests WHERE contest_id = 1;

-- Expected: 0
```

---

## 🔍 Performance Testing

### Test Query Performance

```sql
-- Test 1: User profile lookup (should be < 5ms)
EXPLAIN SELECT * FROM users WHERE user_id = 'test_001';

-- Check: Should use PRIMARY KEY

-- Test 2: Leaderboard generation (should be < 20ms)
EXPLAIN SELECT * FROM leaderboard_view LIMIT 10;

-- Check: Should use index on total_points

-- Test 3: Contest with problems (should be < 15ms)
EXPLAIN
SELECT c.*, p.problem_id, p.title, p.difficulty
FROM contests c
LEFT JOIN problems p ON c.contest_id = p.contest_id
WHERE c.contest_id = 1;

-- Check: Should use index on contest_id

-- Test 4: User submissions (should be < 10ms)
EXPLAIN
SELECT * FROM submission_history_view
WHERE user_id = 'test_001'
ORDER BY submitted_at DESC
LIMIT 20;

-- Check: Should use index on user_id and submitted_at
```

### Measure Actual Performance

```sql
-- Enable profiling
SET profiling = 1;

-- Run queries
SELECT * FROM users WHERE user_id = 'test_001';
SELECT * FROM leaderboard_view LIMIT 10;
SELECT * FROM submission_history_view WHERE user_id = 'test_001' LIMIT 20;

-- Show timing
SHOW PROFILES;

-- Disable profiling
SET profiling = 0;
```

---

## 🧹 Cleanup Test Data

```sql
-- Remove test data (in order due to foreign keys)
DELETE FROM user_activities WHERE user_id = 'test_001';
DELETE FROM submissions WHERE user_id = 'test_001';
DELETE FROM contest_participants WHERE user_id = 'test_001';
DELETE FROM test_cases WHERE problem_id IN (SELECT problem_id FROM problems WHERE contest_id = 1);
DELETE FROM problems WHERE contest_id = 1;
DELETE FROM contests WHERE title LIKE 'Test Contest%';
DELETE FROM users WHERE user_id = 'test_001';

-- Verify cleanup
SELECT COUNT(*) FROM users WHERE user_id = 'test_001';
-- Expected: 0
```

---

## 🐛 Troubleshooting

### Issue 1: "Access denied for user"

```bash
# Solution: Check MySQL user permissions
mysql -u root -p
GRANT ALL PRIVILEGES ON codearena.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Issue 2: "Unknown database 'codearena'"

```sql
-- Solution: Create database first
CREATE DATABASE codearena;
USE codearena;
```

### Issue 3: "Table already exists"

```sql
-- Solution: Drop existing database and recreate
DROP DATABASE IF EXISTS codearena;
CREATE DATABASE codearena;
USE codearena;
SOURCE /path/to/mysql_schema.sql;
```

### Issue 4: "Cannot add foreign key constraint"

```sql
-- Solution: Check if parent table exists and has correct column
SHOW CREATE TABLE contests;
SHOW CREATE TABLE problems;

-- Ensure parent table created before child
```

### Issue 5: Triggers not firing

```sql
-- Check if triggers exist
SHOW TRIGGERS WHERE `Database` = 'codearena';

-- View trigger code
SHOW CREATE TRIGGER after_submission_insert;

-- Drop and recreate if needed
DROP TRIGGER IF EXISTS after_submission_insert;
-- Then recreate from schema file
```

---

## 📊 Health Check Query

Run this comprehensive health check:

```sql
-- Database Health Check
SELECT 'Database Health Check' as Status;

SELECT '1. Tables' as Check_Type, COUNT(*) as Count
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'codearena' AND TABLE_TYPE = 'BASE TABLE'
UNION ALL
SELECT '2. Views', COUNT(*)
FROM information_schema.VIEWS
WHERE TABLE_SCHEMA = 'codearena'
UNION ALL
SELECT '3. Triggers', COUNT(*)
FROM information_schema.TRIGGERS
WHERE TRIGGER_SCHEMA = 'codearena'
UNION ALL
SELECT '4. Procedures', COUNT(*)
FROM information_schema.ROUTINES
WHERE ROUTINE_SCHEMA = 'codearena' AND ROUTINE_TYPE = 'PROCEDURE'
UNION ALL
SELECT '5. Users', COUNT(*)
FROM users
UNION ALL
SELECT '6. Contests', COUNT(*)
FROM contests
UNION ALL
SELECT '7. Problems', COUNT(*)
FROM problems
UNION ALL
SELECT '8. Test Cases', COUNT(*)
FROM test_cases
UNION ALL
SELECT '9. Submissions', COUNT(*)
FROM submissions;

-- Expected:
-- 1. Tables: 7
-- 2. Views: 4
-- 3. Triggers: 3
-- 4. Procedures: 3
-- 5-9. Depends on test data
```

---

## 🎓 Academic Testing Checklist

- [ ] Database created successfully
- [ ] All 7 tables exist
- [ ] All 4 views work correctly
- [ ] All 3 triggers fire on appropriate events
- [ ] All 3 stored procedures execute without errors
- [ ] Foreign key constraints enforce referential integrity
- [ ] Cascade deletes work correctly
- [ ] Unique constraints prevent duplicates
- [ ] Check constraints validate data
- [ ] Sample data inserts successfully
- [ ] Complex queries with JOINs work
- [ ] Leaderboard ranking is correct
- [ ] User statistics update automatically
- [ ] Activity feed maintains last 10 items
- [ ] Contest status calculated correctly
- [ ] Problem acceptance rates computed accurately

---

## 📝 Testing Report Template

```markdown
# CodeArena Database Testing Report

**Date:** [Insert Date]
**Tester:** [Your Name]
**MySQL Version:** [e.g., 8.0.35]

## Installation

- [ ] Database created: ✅ / ❌
- [ ] Schema loaded: ✅ / ❌
- [ ] Sample data present: ✅ / ❌

## Structure Tests

- [ ] All tables exist: ✅ / ❌
- [ ] All views created: ✅ / ❌
- [ ] All triggers active: ✅ / ❌
- [ ] All procedures available: ✅ / ❌

## Functional Tests

- [ ] User registration works: ✅ / ❌
- [ ] Contest creation works: ✅ / ❌
- [ ] Problem addition works: ✅ / ❌
- [ ] Test case insertion works: ✅ / ❌
- [ ] Submission processing works: ✅ / ❌
- [ ] Statistics update automatically: ✅ / ❌
- [ ] Cascade deletes work: ✅ / ❌

## Performance Tests

- [ ] User lookup < 5ms: ✅ / ❌
- [ ] Leaderboard < 20ms: ✅ / ❌
- [ ] Contest query < 15ms: ✅ / ❌
- [ ] Indexes used correctly: ✅ / ❌

## Notes

[Add any observations or issues]

## Conclusion

[Pass/Fail with summary]
```

---

## 🚀 Ready for Production?

Before deploying to production:

1. ✅ All tests pass
2. ✅ Performance benchmarks met
3. ✅ Backup strategy in place
4. ✅ User authentication configured
5. ✅ Connection pooling setup
6. ✅ Monitoring tools configured
7. ✅ Documentation complete
8. ✅ API endpoints tested

---

## 📞 Support Resources

- **MySQL Documentation:** https://dev.mysql.com/doc/
- **SQL Tutorial:** https://www.w3schools.com/sql/
- **MySQL Workbench Guide:** https://dev.mysql.com/doc/workbench/en/

---

**Installation Complete!** 🎉

Your CodeArena database is ready for:

- Academic report demonstrations
- Development and testing
- Performance analysis
- Production deployment (after additional security setup)

---

**End of Installation & Testing Guide**
