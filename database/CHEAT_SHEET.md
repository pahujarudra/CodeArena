# CodeArena Database - Quick Reference Cheat Sheet

## 📊 Table Structure Quick Reference

```
USERS
├─ user_id (PK)
├─ username, fullname, email
├─ stats (problems_solved, total_points, etc.)
└─ created_at, updated_at

CONTESTS
├─ contest_id (PK)
├─ title, description
├─ start_time, end_time
└─ problem_count

PROBLEMS
├─ problem_id (PK)
├─ contest_id (FK → contests)
├─ title, description, difficulty
├─ points, time_limit, memory_limit
└─ stats (total_submissions, accepted_submissions)

TEST_CASES
├─ test_case_id (PK)
├─ problem_id (FK → problems)
├─ input_data, expected_output
└─ is_hidden, test_order

SUBMISSIONS
├─ submission_id (PK)
├─ user_id (FK → users)
├─ problem_id (FK → problems)
├─ contest_id (FK → contests)
├─ code, language, status
└─ passed_tests, total_tests, points_earned

CONTEST_PARTICIPANTS
├─ participation_id (PK)
├─ user_id (FK → users)
├─ contest_id (FK → contests)
└─ joined_at

USER_ACTIVITIES
├─ activity_id (PK)
├─ user_id (FK → users)
├─ problem_id (FK → problems)
├─ contest_id (FK → contests)
└─ status, difficulty, tests, timestamp
```

---

## 🔗 Relationships Cheat Sheet

```
USERS (1) ──────< (N) SUBMISSIONS
USERS (1) ──────< (N) USER_ACTIVITIES
USERS (N) ──────< (M) CONTESTS (via CONTEST_PARTICIPANTS)

CONTESTS (1) ───< (N) PROBLEMS
CONTESTS (1) ───< (N) SUBMISSIONS
CONTESTS (N) ───< (M) USERS (via CONTEST_PARTICIPANTS)

PROBLEMS (1) ───< (N) TEST_CASES
PROBLEMS (1) ───< (N) SUBMISSIONS
```

---

## 🎯 Common Queries Cheat Sheet

### Get User Profile

```sql
SELECT * FROM users WHERE user_id = ?;
```

### Get Leaderboard (Top 10)

```sql
SELECT * FROM leaderboard_view LIMIT 10;
```

### Get Active Contests

```sql
SELECT * FROM contest_status_view
WHERE status = 'active'
ORDER BY start_time DESC;
```

### Get Contest with Problems

```sql
SELECT c.*, p.problem_id, p.title, p.difficulty, p.points
FROM contests c
LEFT JOIN problems p ON c.contest_id = p.contest_id
WHERE c.contest_id = ?;
```

### Get Problem with Test Cases

```sql
SELECT p.*, tc.test_case_id, tc.input_data, tc.expected_output, tc.is_hidden
FROM problems p
LEFT JOIN test_cases tc ON p.problem_id = tc.problem_id
WHERE p.problem_id = ?
ORDER BY tc.test_order;
```

### Get User Submissions

```sql
SELECT * FROM submission_history_view
WHERE user_id = ?
ORDER BY submitted_at DESC
LIMIT 20;
```

### Get User Activities

```sql
SELECT * FROM user_activities
WHERE user_id = ?
ORDER BY activity_timestamp DESC
LIMIT 10;
```

### Insert Submission (Triggers Update Stats)

```sql
INSERT INTO submissions (
  user_id, problem_id, contest_id, code, language,
  status, passed_tests, total_tests, points_earned
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
```

### Check Contest Status

```sql
SELECT
  *,
  CASE
    WHEN NOW() < start_time THEN 'upcoming'
    WHEN NOW() BETWEEN start_time AND end_time THEN 'active'
    ELSE 'ended'
  END as status
FROM contests
WHERE contest_id = ?;
```

### Get Problem Acceptance Rate

```sql
SELECT
  problem_id,
  title,
  total_submissions,
  accepted_submissions,
  ROUND(accepted_submissions * 100.0 / NULLIF(total_submissions, 0), 2) as acceptance_rate
FROM problems
WHERE problem_id = ?;
```

---

## 🔧 Admin Operations

### Create Contest

```sql
INSERT INTO contests (title, description, start_time, end_time)
VALUES (?, ?, ?, ?);
```

### Add Problem to Contest

```sql
INSERT INTO problems (
  contest_id, title, description, difficulty, points,
  time_limit, memory_limit, constraints, input_format, output_format,
  sample_input, sample_output
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
```

### Add Test Case

```sql
INSERT INTO test_cases (problem_id, input_data, expected_output, is_hidden, test_order)
VALUES (?, ?, ?, ?, ?);
```

### Delete Contest (Cascades to Problems)

```sql
DELETE FROM contests WHERE contest_id = ?;
-- Automatically deletes all problems and their test cases
```

### Delete Problem (Cascades to Test Cases)

```sql
DELETE FROM problems WHERE problem_id = ?;
-- Automatically deletes all test cases
```

---

## 🔍 Analytics Queries

### Contest Statistics

```sql
SELECT
  c.contest_id,
  c.title,
  COUNT(DISTINCT p.problem_id) as problem_count,
  COUNT(DISTINCT cp.user_id) as participant_count,
  COUNT(DISTINCT s.submission_id) as total_submissions
FROM contests c
LEFT JOIN problems p ON c.contest_id = p.contest_id
LEFT JOIN contest_participants cp ON c.contest_id = cp.contest_id
LEFT JOIN submissions s ON c.contest_id = s.contest_id
WHERE c.contest_id = ?
GROUP BY c.contest_id;
```

### User Performance Summary

```sql
SELECT
  u.user_id,
  u.username,
  u.problems_solved,
  u.total_points,
  u.easy_problems_solved,
  u.medium_problems_solved,
  u.hard_problems_solved,
  COUNT(DISTINCT s.submission_id) as total_submissions,
  COUNT(DISTINCT CASE WHEN s.status = 'Accepted' THEN s.submission_id END) as accepted_submissions
FROM users u
LEFT JOIN submissions s ON u.user_id = s.user_id
WHERE u.user_id = ?
GROUP BY u.user_id;
```

### Problem Difficulty Distribution

```sql
SELECT
  difficulty,
  COUNT(*) as count,
  AVG(accepted_submissions * 100.0 / NULLIF(total_submissions, 0)) as avg_acceptance_rate
FROM problems
GROUP BY difficulty;
```

### Most Popular Problems

```sql
SELECT
  problem_id,
  title,
  difficulty,
  total_submissions,
  accepted_submissions,
  ROUND(accepted_submissions * 100.0 / NULLIF(total_submissions, 0), 2) as acceptance_rate
FROM problems
ORDER BY total_submissions DESC
LIMIT 10;
```

### Language Usage Statistics

```sql
SELECT
  language,
  COUNT(*) as submission_count,
  COUNT(CASE WHEN status = 'Accepted' THEN 1 END) as accepted_count,
  ROUND(COUNT(CASE WHEN status = 'Accepted' THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate
FROM submissions
GROUP BY language
ORDER BY submission_count DESC;
```

---

## 🚀 Performance Optimization

### Check Query Performance

```sql
EXPLAIN SELECT * FROM submission_history_view WHERE user_id = 'user123';
```

### Show Table Indexes

```sql
SHOW INDEX FROM submissions;
```

### Optimize Table

```sql
OPTIMIZE TABLE submissions;
```

### Analyze Table Statistics

```sql
ANALYZE TABLE submissions;
```

### Check Slow Queries

```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
```

---

## 🛠️ Maintenance Commands

### Backup Database

```bash
mysqldump -u root -p codearena > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
mysql -u root -p codearena < backup_20251210.sql
```

### Check Database Size

```sql
SELECT
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) as size_mb
FROM information_schema.TABLES
WHERE table_schema = 'codearena'
ORDER BY (data_length + index_length) DESC;
```

### Show All Triggers

```sql
SHOW TRIGGERS WHERE `Database` = 'codearena';
```

### Show All Views

```sql
SELECT TABLE_NAME FROM information_schema.VIEWS
WHERE TABLE_SCHEMA = 'codearena';
```

### Show All Stored Procedures

```sql
SHOW PROCEDURE STATUS WHERE Db = 'codearena';
```

---

## 🔒 Security Best Practices

### Create Read-Only User

```sql
CREATE USER 'readonly'@'localhost' IDENTIFIED BY 'password';
GRANT SELECT ON codearena.* TO 'readonly'@'localhost';
```

### Create Application User

```sql
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON codearena.* TO 'app_user'@'localhost';
```

### Create Admin User

```sql
CREATE USER 'admin_user'@'localhost' IDENTIFIED BY 'admin_password';
GRANT ALL PRIVILEGES ON codearena.* TO 'admin_user'@'localhost';
```

---

## 📝 Data Validation Examples

### Check for Orphaned Records

```sql
-- Submissions without valid user
SELECT COUNT(*) FROM submissions
WHERE user_id NOT IN (SELECT user_id FROM users);

-- Problems without valid contest
SELECT COUNT(*) FROM problems
WHERE contest_id NOT IN (SELECT contest_id FROM contests);
```

### Verify Data Consistency

```sql
-- Check if user stats match actual submissions
SELECT
  u.user_id,
  u.total_submissions as recorded_submissions,
  COUNT(s.submission_id) as actual_submissions,
  u.total_submissions - COUNT(s.submission_id) as difference
FROM users u
LEFT JOIN submissions s ON u.user_id = s.user_id
GROUP BY u.user_id
HAVING difference != 0;
```

---

## 🎓 Academic Report Queries

### Show Normalization

```sql
-- Demonstrate 3NF: No transitive dependencies
-- users table: all non-key attributes depend only on user_id
-- problems table: all non-key attributes depend only on problem_id
```

### Show Foreign Key Constraints

```sql
SELECT
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'codearena'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### Show Cardinality

```sql
-- One-to-Many: One user has many submissions
SELECT u.username, COUNT(s.submission_id) as submission_count
FROM users u
LEFT JOIN submissions s ON u.user_id = s.user_id
GROUP BY u.user_id;

-- Many-to-Many: Users and Contests
SELECT u.username, COUNT(cp.contest_id) as contests_participated
FROM users u
LEFT JOIN contest_participants cp ON u.user_id = cp.user_id
GROUP BY u.user_id;
```

---

## 🐛 Troubleshooting

### Problem: Foreign Key Constraint Fails

```sql
-- Check if parent record exists
SELECT * FROM contests WHERE contest_id = 999;
```

### Problem: Duplicate Entry

```sql
-- Check existing records
SELECT * FROM users WHERE username = 'john_doe';

-- Use INSERT IGNORE or ON DUPLICATE KEY UPDATE
INSERT INTO users (user_id, username, ...)
VALUES (?, ?, ...)
ON DUPLICATE KEY UPDATE updated_at = NOW();
```

### Problem: Trigger Not Working

```sql
-- Check trigger status
SHOW TRIGGERS WHERE `Table` = 'submissions';

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS after_submission_insert;
-- Then recreate from schema file
```

---

## 📊 Quick Stats Dashboard Query

```sql
SELECT
  'Total Users' as metric, COUNT(*) as value FROM users
UNION ALL
SELECT 'Total Contests', COUNT(*) FROM contests
UNION ALL
SELECT 'Total Problems', COUNT(*) FROM problems
UNION ALL
SELECT 'Total Submissions', COUNT(*) FROM submissions
UNION ALL
SELECT 'Active Contests', COUNT(*) FROM contest_status_view WHERE status = 'active'
UNION ALL
SELECT 'Total Test Cases', COUNT(*) FROM test_cases;
```

---

## 🔗 Useful Views

```sql
-- Use pre-built views for common queries
SELECT * FROM contest_status_view;      -- Contests with status
SELECT * FROM problem_stats_view;       -- Problems with stats
SELECT * FROM leaderboard_view;         -- User rankings
SELECT * FROM submission_history_view;  -- Detailed submissions
```

---

## 💡 Tips

1. **Always use prepared statements** to prevent SQL injection
2. **Use transactions** for operations that update multiple tables
3. **Let triggers handle statistics** - don't update manually
4. **Use views** for complex queries that are frequently needed
5. **Monitor slow queries** and add indexes as needed
6. **Regular backups** are essential
7. **Use EXPLAIN** to optimize query performance

---

**Quick Access Files:**

- Full Schema: `mysql_schema.sql`
- ER Diagram: `ER_DIAGRAM.md`
- Migration Guide: `MIGRATION_GUIDE.md`
- Visual Diagram: `ER_DIAGRAM_VISUAL.txt`
- Comparison: `FIREBASE_VS_MYSQL.md`

---

**End of Cheat Sheet**
