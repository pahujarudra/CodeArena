# CodeArena Database Documentation

Complete MySQL database design for the CodeArena competitive programming platform.

---

## 📁 Files in this Directory

### 1. **mysql_schema.sql**

Complete MySQL database schema with:

- 7 normalized tables
- Foreign key constraints
- Indexes for performance
- 4 views for common queries
- 3 stored procedures
- 3 triggers for automation
- Sample data

### 2. **ER_DIAGRAM.md**

Entity-Relationship documentation including:

- Entity definitions
- Relationship mappings
- Cardinality specifications
- Normalization analysis (1NF, 2NF, 3NF)
- Firebase to MySQL mapping

### 3. **MIGRATION_GUIDE.md**

Step-by-step migration instructions:

- Architecture comparison
- Data transformation scripts
- Query conversion examples
- Application code changes
- Deployment instructions

### 4. **README.md** (this file)

Overview and quick start guide

---

## 🗄️ Database Schema Overview

### Tables

1. **users** - User accounts and statistics
2. **contests** - Programming contests
3. **problems** - Coding problems
4. **test_cases** - Problem test cases
5. **submissions** - User code submissions
6. **contest_participants** - Contest participation tracking
7. **user_activities** - Recent user activities

### Views

1. **contest_status_view** - Contests with live status
2. **problem_stats_view** - Problems with acceptance rates
3. **leaderboard_view** - User rankings
4. **submission_history_view** - Detailed submission history

---

## 🚀 Quick Start

### Prerequisites

- MySQL 8.0 or higher
- MySQL client or MySQL Workbench

### Installation

```bash
# 1. Create database
mysql -u root -p
CREATE DATABASE codearena;
USE codearena;

# 2. Run schema
SOURCE mysql_schema.sql;

# 3. Verify installation
SHOW TABLES;
SELECT * FROM users;
```

### Quick Test

```sql
-- Check all tables
SELECT
    TABLE_NAME,
    TABLE_ROWS
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'codearena'
ORDER BY TABLE_NAME;

-- Test views
SELECT * FROM contest_status_view;
SELECT * FROM leaderboard_view LIMIT 10;

-- Test triggers (insert a submission)
INSERT INTO submissions (
    user_id, problem_id, code, language,
    status, passed_tests, total_tests, points_earned
) VALUES (
    'admin_123456', 1, 'test code', 'java',
    'Accepted', 10, 10, 100
);

-- Verify user stats updated automatically
SELECT total_submissions, problems_solved, total_points
FROM users WHERE user_id = 'admin_123456';
```

---

## 📊 Database Statistics

### Normalization Level

- **Third Normal Form (3NF)** achieved
- Minimal denormalization for performance (activity feeds)

### Relationships

- **5 One-to-Many** relationships
- **1 Many-to-Many** relationship (users ↔ contests)

### Constraints

- **7 Primary Keys** (all tables)
- **12 Foreign Keys** (referential integrity)
- **3 Unique Constraints** (prevent duplicates)
- **1 Check Constraint** (contest time validation)

### Performance Features

- **20+ Indexes** for fast queries
- **4 Views** for complex queries
- **3 Triggers** for automatic updates
- **3 Stored Procedures** for business logic

---

## 🔗 Entity Relationships

```
USERS (1) ←──→ (N) SUBMISSIONS ←──→ (1) PROBLEMS ←──→ (1) CONTESTS
  │                                       │
  │ (1)                                   │ (1)
  │                                       │
  ↓ (N)                                   ↓ (N)
USER_ACTIVITIES                      TEST_CASES

USERS (N) ←──────────────────→ (M) CONTESTS
           (via CONTEST_PARTICIPANTS)
```

---

## 📝 Key Features

### 1. Automatic Statistics

Triggers automatically update:

- User problem counts
- Contest problem counts
- Submission statistics
- User activity feeds

### 2. Data Integrity

Foreign keys ensure:

- No orphaned submissions
- Valid user/problem/contest references
- Cascade deletes maintain consistency

### 3. Performance Optimizations

- Composite indexes for common queries
- Views for complex aggregations
- Connection pooling support
- Query result caching ready

### 4. Scalability

- Normalized structure reduces redundancy
- Indexed columns for fast lookups
- Partitioning-ready design
- Supports read replicas

---

## 🔍 Common Queries

### Get Active Contests

```sql
SELECT * FROM contest_status_view
WHERE status = 'active'
ORDER BY start_time DESC;
```

### Get Leaderboard

```sql
SELECT * FROM leaderboard_view
LIMIT 10;
```

### Get User's Submissions

```sql
SELECT * FROM submission_history_view
WHERE user_id = 'user_123'
ORDER BY submitted_at DESC
LIMIT 20;
```

### Get Problem with Test Cases

```sql
SELECT
    p.*,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'test_case_id', tc.test_case_id,
            'input', tc.input_data,
            'output', tc.expected_output,
            'is_hidden', tc.is_hidden
        )
    ) as test_cases
FROM problems p
LEFT JOIN test_cases tc ON p.problem_id = tc.problem_id
WHERE p.problem_id = 1
GROUP BY p.problem_id;
```

### Get Contest Problems with Stats

```sql
SELECT
    p.problem_id,
    p.title,
    p.difficulty,
    p.points,
    p.total_submissions,
    p.accepted_submissions,
    ROUND(p.accepted_submissions * 100.0 / NULLIF(p.total_submissions, 0), 2) as acceptance_rate
FROM problems p
WHERE p.contest_id = 1
ORDER BY p.points ASC;
```

---

## 🔐 Security Considerations

### User Authentication

- Firebase Auth UIDs supported (VARCHAR(128))
- Password hashing in application layer (JWT)
- Session management via tokens

### SQL Injection Prevention

- Always use prepared statements
- Parameterized queries only
- Input validation in application layer

### Access Control

- `is_admin` flag for admin privileges
- Row-level security in application layer
- Read-only user accounts for reporting

---

## 📈 Performance Benchmarks

### Expected Query Performance

- User profile lookup: < 5ms
- Leaderboard top 100: < 20ms
- Contest with problems: < 15ms
- Submission history (20 items): < 10ms

### Optimization Tips

```sql
-- Analyze query performance
EXPLAIN SELECT * FROM submission_history_view WHERE user_id = 'user_123';

-- Monitor slow queries
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- Check index usage
SHOW INDEX FROM submissions;

-- Optimize tables
OPTIMIZE TABLE submissions;
```

---

## 🧪 Testing

### Sample Data

Schema includes sample users:

- Admin user: `admin_123456` (username: `admin`)
- Test users: `user_001` (john_doe), `user_002` (jane_smith)

### Test Scenarios

1. **User Registration**

```sql
INSERT INTO users (user_id, username, fullname, email)
VALUES ('test_user', 'testuser', 'Test User', 'test@example.com');
```

2. **Create Contest**

```sql
INSERT INTO contests (title, description, start_time, end_time)
VALUES (
    'Test Contest',
    'A test contest',
    '2025-12-15 10:00:00',
    '2025-12-15 12:00:00'
);
```

3. **Add Problem**

```sql
INSERT INTO problems (contest_id, title, description, difficulty, points, time_limit, memory_limit)
VALUES (1, 'Test Problem', 'Solve this', 'Easy', 100, 1000, 256);
```

4. **Submit Solution**

```sql
INSERT INTO submissions (
    user_id, problem_id, code, language,
    status, passed_tests, total_tests, points_earned
) VALUES (
    'test_user', 1, 'public class Solution {}', 'java',
    'Accepted', 5, 5, 100
);

-- Check if stats updated
SELECT * FROM users WHERE user_id = 'test_user';
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Foreign Key Constraint Fails**

```sql
-- Check if parent record exists
SELECT * FROM contests WHERE contest_id = 1;
SELECT * FROM users WHERE user_id = 'user_123';
```

**2. Trigger Not Firing**

```sql
-- Check trigger status
SHOW TRIGGERS WHERE `Table` = 'submissions';

-- View trigger code
SHOW CREATE TRIGGER after_submission_insert;
```

**3. Slow Queries**

```sql
-- Add missing indexes
CREATE INDEX idx_custom ON table_name(column1, column2);

-- Update statistics
ANALYZE TABLE submissions;
```

**4. Duplicate Key Error**

```sql
-- Check unique constraints
SHOW INDEX FROM users WHERE Key_name = 'username';

-- Use INSERT IGNORE or ON DUPLICATE KEY UPDATE
INSERT INTO contest_participants (user_id, contest_id)
VALUES ('user_123', 1)
ON DUPLICATE KEY UPDATE joined_at = joined_at;
```

---

## 📚 Additional Resources

### Documentation

- [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)
- [Database Normalization Guide](https://en.wikipedia.org/wiki/Database_normalization)
- [SQL Performance Tuning](https://use-the-index-luke.com/)

### Tools

- **MySQL Workbench** - Visual database design
- **phpMyAdmin** - Web-based administration
- **DBeaver** - Universal database tool
- **DataGrip** - JetBrains database IDE

### Related Files

- `../src/firebase.js` - Original Firebase configuration
- `../src/pages/*.jsx` - Application code using Firebase
- `MIGRATION_GUIDE.md` - Detailed migration instructions

---

## 🎓 Academic Use

This database design is suitable for:

- Database Management Systems (DBMS) course projects
- SQL query practice
- Normalization exercises
- Index optimization studies
- Trigger and stored procedure examples

### Learning Objectives Covered

✅ ER modeling and design
✅ Normalization (1NF, 2NF, 3NF)
✅ Primary and foreign keys
✅ Complex queries with JOINs
✅ Views and subqueries
✅ Stored procedures and triggers
✅ Index design and optimization
✅ Data integrity constraints

---

## 📞 Support

For questions about this database design:

1. Check the documentation files in this directory
2. Review the MIGRATION_GUIDE.md for detailed examples
3. Examine the SQL comments in mysql_schema.sql

---

## 📄 License

This database schema is part of the CodeArena project.

---

## 🔄 Version History

- **v1.0** (December 2025) - Initial MySQL conversion from Firebase
  - 7 tables with full normalization
  - 4 views for common queries
  - 3 triggers for automation
  - 3 stored procedures
  - Complete documentation

---

## ✅ Checklist for Academic Report

- [x] Complete ER diagram
- [x] Normalized to 3NF
- [x] All relationships documented
- [x] Foreign keys implemented
- [x] Indexes for performance
- [x] Sample queries provided
- [x] Test data included
- [x] Migration documentation
- [x] Performance considerations
- [x] Security measures

---

**End of README**
