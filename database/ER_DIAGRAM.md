# CodeArena Database - Entity Relationship Diagram

## Database Design Overview

This document describes the Entity-Relationship model for the CodeArena competitive programming platform, converted from Firebase Firestore to MySQL relational database.

---

## Entities and Relationships

### 1. **USERS** (Strong Entity)

**Primary Key:** `user_id`

| Attribute              | Type         | Description                 |
| ---------------------- | ------------ | --------------------------- |
| user_id                | VARCHAR(128) | Unique identifier (PK)      |
| username               | VARCHAR(20)  | Unique username             |
| fullname               | VARCHAR(50)  | Full name                   |
| email                  | VARCHAR(255) | Email address (Unique)      |
| photo_url              | VARCHAR(512) | Profile picture URL         |
| is_admin               | BOOLEAN      | Admin flag                  |
| problems_solved        | INT          | Total solved count          |
| total_points           | INT          | Points earned               |
| total_submissions      | INT          | Submission count            |
| contests_participated  | INT          | Contest participation count |
| easy_problems_solved   | INT          | Easy problems solved        |
| medium_problems_solved | INT          | Medium problems solved      |
| hard_problems_solved   | INT          | Hard problems solved        |
| created_at             | TIMESTAMP    | Account creation time       |
| updated_at             | TIMESTAMP    | Last update time            |

---

### 2. **CONTESTS** (Strong Entity)

**Primary Key:** `contest_id`

| Attribute     | Type         | Description           |
| ------------- | ------------ | --------------------- |
| contest_id    | INT          | Auto-increment PK     |
| title         | VARCHAR(255) | Contest name          |
| description   | TEXT         | Contest details       |
| start_time    | DATETIME     | Start date/time       |
| end_time      | DATETIME     | End date/time         |
| problem_count | INT          | Number of problems    |
| created_at    | TIMESTAMP    | Creation timestamp    |
| updated_at    | TIMESTAMP    | Last update timestamp |

**Constraints:**

- `end_time` > `start_time`

---

### 3. **PROBLEMS** (Strong Entity)

**Primary Key:** `problem_id`
**Foreign Key:** `contest_id` → CONTESTS

| Attribute            | Type         | Description             |
| -------------------- | ------------ | ----------------------- |
| problem_id           | INT          | Auto-increment PK       |
| contest_id           | INT          | Associated contest (FK) |
| title                | VARCHAR(255) | Problem title           |
| description          | TEXT         | Problem statement       |
| difficulty           | ENUM         | Easy/Medium/Hard        |
| points               | INT          | Points for solving      |
| time_limit           | INT          | Time limit (ms)         |
| memory_limit         | INT          | Memory limit (MB)       |
| constraints          | TEXT         | Problem constraints     |
| input_format         | TEXT         | Input specification     |
| output_format        | TEXT         | Output specification    |
| sample_input         | TEXT         | Sample input data       |
| sample_output        | TEXT         | Sample output data      |
| total_submissions    | INT          | Total attempts          |
| accepted_submissions | INT          | Successful attempts     |
| created_at           | TIMESTAMP    | Creation timestamp      |
| updated_at           | TIMESTAMP    | Last update timestamp   |

**Relationships:**

- Many-to-One with CONTESTS (Many problems belong to one contest)
- One-to-Many with TEST_CASES
- One-to-Many with SUBMISSIONS

---

### 4. **TEST_CASES** (Weak Entity)

**Primary Key:** `test_case_id`
**Foreign Key:** `problem_id` → PROBLEMS

| Attribute       | Type      | Description             |
| --------------- | --------- | ----------------------- |
| test_case_id    | INT       | Auto-increment PK       |
| problem_id      | INT       | Associated problem (FK) |
| input_data      | TEXT      | Test input              |
| expected_output | TEXT      | Expected result         |
| is_hidden       | BOOLEAN   | Visibility flag         |
| test_order      | INT       | Display order           |
| created_at      | TIMESTAMP | Creation timestamp      |

**Relationships:**

- Many-to-One with PROBLEMS (Depends on problem existence)

---

### 5. **SUBMISSIONS** (Strong Entity)

**Primary Key:** `submission_id`
**Foreign Keys:** `user_id` → USERS, `problem_id` → PROBLEMS, `contest_id` → CONTESTS

| Attribute     | Type         | Description                          |
| ------------- | ------------ | ------------------------------------ |
| submission_id | INT          | Auto-increment PK                    |
| user_id       | VARCHAR(128) | Submitting user (FK)                 |
| problem_id    | INT          | Problem attempted (FK)               |
| contest_id    | INT          | Contest context (FK, nullable)       |
| code          | TEXT         | Source code                          |
| language      | VARCHAR(20)  | Programming language                 |
| status        | ENUM         | Verdict (Accepted/Wrong Answer/etc.) |
| passed_tests  | INT          | Tests passed                         |
| total_tests   | INT          | Total tests                          |
| points_earned | INT          | Points awarded                       |
| submitted_at  | TIMESTAMP    | Submission time                      |

**Relationships:**

- Many-to-One with USERS (User makes many submissions)
- Many-to-One with PROBLEMS (Problem receives many submissions)
- Many-to-One with CONTESTS (Optional contest context)

---

### 6. **CONTEST_PARTICIPANTS** (Associative Entity)

**Primary Key:** `participation_id`
**Foreign Keys:** `user_id` → USERS, `contest_id` → CONTESTS

| Attribute        | Type         | Description       |
| ---------------- | ------------ | ----------------- |
| participation_id | INT          | Auto-increment PK |
| user_id          | VARCHAR(128) | Participant (FK)  |
| contest_id       | INT          | Contest (FK)      |
| joined_at        | TIMESTAMP    | Join timestamp    |

**Relationships:**

- Many-to-Many resolver between USERS and CONTESTS
- Unique constraint on (user_id, contest_id)

---

### 7. **USER_ACTIVITIES** (Strong Entity)

**Primary Key:** `activity_id`
**Foreign Keys:** `user_id` → USERS, `problem_id` → PROBLEMS, `contest_id` → CONTESTS

| Attribute          | Type         | Description            |
| ------------------ | ------------ | ---------------------- |
| activity_id        | INT          | Auto-increment PK      |
| user_id            | VARCHAR(128) | User (FK)              |
| problem_id         | INT          | Problem (FK)           |
| contest_id         | INT          | Contest (FK, nullable) |
| problem_title      | VARCHAR(255) | Problem name snapshot  |
| contest_title      | VARCHAR(255) | Contest name snapshot  |
| status             | VARCHAR(50)  | Activity status        |
| difficulty         | VARCHAR(20)  | Problem difficulty     |
| passed_tests       | INT          | Tests passed           |
| total_tests        | INT          | Total tests            |
| activity_timestamp | TIMESTAMP    | Activity time          |

**Relationships:**

- Many-to-One with USERS (Activity feed per user)
- Stores denormalized data for performance

---

## Relationship Summary

### One-to-Many Relationships

1. **CONTESTS → PROBLEMS**

   - One contest contains many problems
   - CASCADE DELETE: Deleting contest removes all its problems

2. **PROBLEMS → TEST_CASES**

   - One problem has many test cases
   - CASCADE DELETE: Deleting problem removes all its test cases

3. **USERS → SUBMISSIONS**

   - One user makes many submissions
   - CASCADE DELETE: Deleting user removes their submissions

4. **PROBLEMS → SUBMISSIONS**

   - One problem receives many submissions
   - CASCADE DELETE: Deleting problem removes all submissions

5. **CONTESTS → SUBMISSIONS**

   - One contest has many submissions
   - SET NULL: Deleting contest keeps submissions but nullifies contest_id

6. **USERS → USER_ACTIVITIES**
   - One user has many activities
   - CASCADE DELETE: Deleting user removes their activities

### Many-to-Many Relationships

1. **USERS ↔ CONTESTS** (via CONTEST_PARTICIPANTS)
   - Users can participate in many contests
   - Contests can have many participants
   - Tracks participation history

---

## Cardinality Notation

```
USERS (1) ────────< (N) SUBMISSIONS
PROBLEMS (1) ──────< (N) SUBMISSIONS
CONTESTS (1) ──────< (N) SUBMISSIONS
CONTESTS (1) ──────< (N) PROBLEMS
PROBLEMS (1) ──────< (N) TEST_CASES
USERS (N) ────────< (M) CONTESTS [via CONTEST_PARTICIPANTS]
USERS (1) ────────< (N) USER_ACTIVITIES
```

---

## ER Diagram (Text Representation)

```
┌─────────────────┐
│     USERS       │
│  PK: user_id    │
└────────┬────────┘
         │
         │ 1
         │
         │ N
    ┌────┴──────────────┐
    │                   │
┌───▼────────────┐  ┌───▼─────────────┐
│  SUBMISSIONS   │  │ USER_ACTIVITIES │
│ PK: subm_id    │  │ PK: activity_id │
│ FK: user_id    │  │ FK: user_id     │
│ FK: problem_id │  │ FK: problem_id  │
│ FK: contest_id │  └─────────────────┘
└───┬────────────┘
    │
    │ N
    │
    │ 1
┌───▼─────────────┐      1        N    ┌──────────────────┐
│    PROBLEMS     │◄─────────────────────│   TEST_CASES    │
│ PK: problem_id  │                      │ PK: test_case_id│
│ FK: contest_id  │                      │ FK: problem_id  │
└───┬─────────────┘                      └─────────────────┘
    │
    │ N
    │
    │ 1
┌───▼─────────────┐           N        M    ┌──────────────────────┐
│    CONTESTS     │◄────────────────────────│ CONTEST_PARTICIPANTS │
│ PK: contest_id  │                          │ PK: participation_id │
└─────────────────┘                          │ FK: user_id          │
                                             │ FK: contest_id       │
                                             └──────────────────────┘
```

---

## Normalization Analysis

This section demonstrates the step-by-step normalization process from unnormalized data to Third Normal Form (3NF).

---

### Example 1: User Submissions Data

#### Unnormalized Form (0NF)

**Problems with Unnormalized Data:**

- Repeating groups (multiple submissions in one row)
- Non-atomic values (arrays/lists)
- Data redundancy

```
User_Submissions (Unnormalized)
┌─────────┬──────────┬───────────────────────────────────────────────────┐
│ user_id │ username │ submissions                                       │
├─────────┼──────────┼───────────────────────────────────────────────────┤
│ 1       │ alice    │ [{problem: "Sum", score: 100, time: "10:00"},     │
│         │          │  {problem: "Sort", score: 85, time: "10:15"}]     │
│ 2       │ bob      │ [{problem: "Sum", score: 100, time: "10:05"}]     │
└─────────┴──────────┴───────────────────────────────────────────────────┘
```

**Issues:**

- Submissions stored as repeating group (violates 1NF)
- Difficult to query individual submissions
- Cannot efficiently search by problem or score

---

#### First Normal Form (1NF) ✓

**Rules Applied:**

- Eliminate repeating groups
- Create separate rows for each submission
- Ensure all attributes are atomic

```
User_Submissions_1NF
┌─────────┬──────────┬──────────────┬───────┬──────────────────────┐
│ user_id │ username │ problem_name │ score │ submitted_at         │
├─────────┼──────────┼──────────────┼───────┼──────────────────────┤
│ 1       │ alice    │ Sum          │ 100   │ 2025-12-11 10:00:00  │
│ 1       │ alice    │ Sort         │ 85    │ 2025-12-11 10:15:00  │
│ 2       │ bob      │ Sum          │ 100   │ 2025-12-11 10:05:00  │
└─────────┴──────────┴──────────────┴───────┴──────────────────────┘
```

**Improvements:**
✅ All values are atomic
✅ Each row represents one submission
✅ Can query individual submissions

**Remaining Issues:**
❌ Partial dependency: username depends only on user_id (not on full key)
❌ Data redundancy: username repeated for each user's submission

---

#### Second Normal Form (2NF) ✓

**Rules Applied:**

- Remove partial dependencies
- Create separate table for user information
- Non-key attributes must depend on the entire primary key

**Composite Primary Key:** (user_id, problem_name, submitted_at)

```
Users_2NF
┌─────────┬──────────┬────────────────────┐
│ user_id │ username │ email              │
├─────────┼──────────┼────────────────────┤
│ 1       │ alice    │ alice@example.com  │
│ 2       │ bob      │ bob@example.com    │
└─────────┴──────────┴────────────────────┘
PK: user_id

Submissions_2NF
┌─────────┬──────────────┬───────┬──────────────────────┐
│ user_id │ problem_name │ score │ submitted_at         │
├─────────┼──────────────┼───────┼──────────────────────┤
│ 1       │ Sum          │ 100   │ 2025-12-11 10:00:00  │
│ 1       │ Sort         │ 85    │ 2025-12-11 10:15:00  │
│ 2       │ Sum          │ 100   │ 2025-12-11 10:05:00  │
└─────────┴──────────────┴───────┴──────────────────────┘
PK: (user_id, problem_name, submitted_at)
FK: user_id → Users_2NF(user_id)
```

**Improvements:**
✅ No partial dependencies
✅ Username stored only once per user
✅ User information separated from submission data

**Remaining Issues:**
❌ Transitive dependency: If we add problem_difficulty, it depends on problem_name, not the primary key

---

#### Third Normal Form (3NF) ✓

**Rules Applied:**

- Remove transitive dependencies
- Create separate tables for problems
- All non-key attributes depend ONLY on the primary key

```
Users_3NF
┌─────────┬──────────┬───────────────────┬──────────────┬────────┐
│ user_id │ username │ email             │ total_solved │ rating │
├─────────┼──────────┼───────────────────┼──────────────┼────────┤
│ 1       │ alice    │ alice@example.com │ 15           │ 1450   │
│ 2       │ bob      │ bob@example.com   │ 8            │ 1200   │
└─────────┴──────────┴───────────────────┴──────────────┴────────┘
PK: user_id
Unique: username, email

Problems_3NF
┌────────────┬──────────────┬────────────┬───────────┬────────────┐
│ problem_id │ title        │ difficulty │ max_score │ contest_id │
├────────────┼──────────────┼────────────┼───────────┼────────────┤
│ 1          │ Sum          │ Easy       │ 100       │ 10         │
│ 2          │ Sort         │ Medium     │ 200       │ 10         │
└────────────┴──────────────┴────────────┴───────────┴────────────┘
PK: problem_id
FK: contest_id → Contests(contest_id)

Submissions_3NF
┌───────────────┬─────────┬────────────┬───────┬────────┬──────────────────────┐
│ submission_id │ user_id │ problem_id │ score │ status │ submitted_at         │
├───────────────┼─────────┼────────────┼───────┼────────┼──────────────────────┤
│ 1             │ 1       │ 1          │ 100   │ AC     │ 2025-12-11 10:00:00  │
│ 2             │ 1       │ 2          │ 85    │ WA     │ 2025-12-11 10:15:00  │
│ 3             │ 2       │ 1          │ 100   │ AC     │ 2025-12-11 10:05:00  │
└───────────────┴─────────┴────────────┴───────┴────────┴──────────────────────┘
PK: submission_id
FK: user_id → Users(user_id) ON DELETE CASCADE
FK: problem_id → Problems(problem_id) ON DELETE CASCADE
```

**Improvements:**
✅ No transitive dependencies
✅ Problem information stored only once
✅ Submissions reference problems via foreign key
✅ Each entity has its own table
✅ Referential integrity enforced

---

### Example 2: Contest Participation

#### Unnormalized Form (0NF)

```
Contests_Unnormalized
┌────────────┬──────────────┬──────────────────────────────────────────┐
│ contest_id │ contest_name │ participants                             │
├────────────┼──────────────┼──────────────────────────────────────────┤
│ 10         │ Weekly #1    │ [{user: "alice", rank: 1, score: 500},   │
│            │              │  {user: "bob", rank: 2, score: 450}]     │
│ 11         │ Weekly #2    │ [{user: "alice", rank: 3, score: 400}]   │
└────────────┴──────────────┴──────────────────────────────────────────┘
```

**Issues:**

- Participants stored as nested array
- Cannot efficiently query by participant
- Difficult to track individual participation

---

#### First Normal Form (1NF) ✓

```
Contest_Participants_1NF
┌────────────┬──────────────┬──────────┬──────┬───────┐
│ contest_id │ contest_name │ username │ rank │ score │
├────────────┼──────────────┼──────────┼──────┼───────┤
│ 10         │ Weekly #1    │ alice    │ 1    │ 500   │
│ 10         │ Weekly #1    │ bob      │ 2    │ 450   │
│ 11         │ Weekly #2    │ alice    │ 3    │ 400   │
└────────────┴──────────────┴──────────┴──────┴───────┘
```

**Improvements:**
✅ Atomic values
✅ Each participation is a separate row

**Issues:**
❌ contest_name depends only on contest_id (partial dependency)
❌ username not normalized (should be user_id)

---

#### Second Normal Form (2NF) ✓

```
Contests_2NF
┌────────────┬──────────────┬──────────────────────┬──────────────────────┐
│ contest_id │ title        │ start_time           │ end_time             │
├────────────┼──────────────┼──────────────────────┼──────────────────────┤
│ 10         │ Weekly #1    │ 2025-12-10 10:00:00  │ 2025-12-10 13:00:00  │
│ 11         │ Weekly #2    │ 2025-12-11 10:00:00  │ 2025-12-11 13:00:00  │
└────────────┴──────────────┴──────────────────────┴──────────────────────┘
PK: contest_id

Participants_2NF
┌────────────┬─────────┬──────┬───────┬──────────────────────┐
│ contest_id │ user_id │ rank │ score │ joined_at            │
├────────────┼─────────┼──────┼───────┼──────────────────────┤
│ 10         │ 1       │ 1    │ 500   │ 2025-12-10 09:55:00  │
│ 10         │ 2       │ 2    │ 450   │ 2025-12-10 09:58:00  │
│ 11         │ 1       │ 3    │ 400   │ 2025-12-11 09:50:00  │
└────────────┴─────────┴──────┴───────┴──────────────────────┘
PK: (contest_id, user_id)
FK: contest_id → Contests(contest_id)
FK: user_id → Users(user_id)
```

**Improvements:**
✅ No partial dependencies
✅ Contest information separated
✅ Using user_id instead of username

---

#### Third Normal Form (3NF) ✓ - Final Schema

```
Users
┌─────────┬──────────┬───────────────────┬──────────────┬────────┐
│ user_id │ username │ email             │ total_solved │ rating │
├─────────┼──────────┼───────────────────┼──────────────┼────────┤
│ 1       │ alice    │ alice@example.com │ 15           │ 1450   │
│ 2       │ bob      │ bob@example.com   │ 8            │ 1200   │
└─────────┴──────────┴───────────────────┴──────────────┴────────┘
PK: user_id

Contests
┌────────────┬──────────────┬──────────────────────┬──────────────────────┬─────────────┐
│ contest_id │ title        │ start_time           │ end_time             │ total_score │
├────────────┼──────────────┼──────────────────────┼──────────────────────┼─────────────┤
│ 10         │ Weekly #1    │ 2025-12-10 10:00:00  │ 2025-12-10 13:00:00  │ 1000        │
│ 11         │ Weekly #2    │ 2025-12-11 10:00:00  │ 2025-12-11 13:00:00  │ 800         │
└────────────┴──────────────┴──────────────────────┴──────────────────────┴─────────────┘
PK: contest_id

Contest_Participants (Associative Entity)
┌────────────────┬────────────┬─────────┬──────────────────────┐
│ participant_id │ contest_id │ user_id │ joined_at            │
├────────────────┼────────────┼─────────┼──────────────────────┤
│ 1              │ 10         │ 1       │ 2025-12-10 09:55:00  │
│ 2              │ 10         │ 2       │ 2025-12-10 09:58:00  │
│ 3              │ 11         │ 1       │ 2025-12-11 09:50:00  │
└────────────────┴────────────┴─────────┴──────────────────────┘
PK: participant_id
Unique: (contest_id, user_id)
FK: contest_id → Contests(contest_id) ON DELETE CASCADE
FK: user_id → Users(user_id) ON DELETE CASCADE
```

**Final Improvements:**
✅ No transitive dependencies
✅ Many-to-Many relationship properly modeled
✅ Surrogate primary key (participant_id) for better performance
✅ Composite unique constraint prevents duplicate entries
✅ ON DELETE CASCADE maintains referential integrity

---

### Example 3: Test Cases (Weak Entity)

#### Unnormalized Form (0NF)

```
Problems_With_TestCases_Unnormalized
┌────────────┬──────────────┬────────────────────────────────────────────────┐
│ problem_id │ title        │ test_cases                                     │
├────────────┼──────────────┼────────────────────────────────────────────────┤
│ 1          │ Sum          │ [{"in": "5 3", "out": "8", "sample": true},    │
│            │              │  {"in": "10 20", "out": "30", "sample": false}]│
│ 2          │ Sort         │ [{"in": "3 1 2", "out": "1 2 3"}]              │
└────────────┴──────────────┴────────────────────────────────────────────────┘
```

**Issues:**

- Test cases stored as array (non-atomic)
- Cannot query individual test cases
- Difficult to update specific test cases

---

#### First Normal Form (1NF) ✓

```
Problem_TestCases_1NF
┌────────────┬──────────────┬───────────────┬─────────────────┬───────────┐
│ problem_id │ title        │ input         │ expected_output │ is_sample │
├────────────┼──────────────┼───────────────┼─────────────────┼───────────┤
│ 1          │ Sum          │ 5 3           │ 8               │ 1         │
│ 1          │ Sum          │ 10 20         │ 30              │ 0         │
│ 2          │ Sort         │ 3 1 2         │ 1 2 3           │ 1         │
└────────────┴──────────────┴───────────────┴─────────────────┴───────────┘
```

**Improvements:**
✅ Each test case is a separate row
✅ All values are atomic

**Issues:**
❌ No unique identifier for test cases
❌ title depends only on problem_id (partial dependency)

---

#### Second Normal Form (2NF) ✓

```
Problems_2NF
┌────────────┬──────────────┬────────────┬───────────┐
│ problem_id │ title        │ difficulty │ max_score │
├────────────┼──────────────┼────────────┼───────────┤
│ 1          │ Sum          │ Easy       │ 100       │
│ 2          │ Sort         │ Medium     │ 200       │
└────────────┴──────────────┴────────────┴───────────┘
PK: problem_id

TestCases_2NF
┌────────────┬──────────┬───────────────┬─────────────────┬───────────┐
│ problem_id │ case_num │ input         │ expected_output │ is_sample │
├────────────┼──────────┼───────────────┼─────────────────┼───────────┤
│ 1          │ 1        │ 5 3           │ 8               │ 1         │
│ 1          │ 2        │ 10 20         │ 30              │ 0         │
│ 2          │ 1        │ 3 1 2         │ 1 2 3           │ 1         │
└────────────┴──────────┴───────────────┴─────────────────┴───────────┘
PK: (problem_id, case_num)
FK: problem_id → Problems(problem_id)
```

**Improvements:**
✅ Problem information separated
✅ Composite primary key identifies each test case uniquely

---

#### Third Normal Form (3NF) ✓ - Final Schema

```
Problems
┌────────────┬──────────────┬────────────┬───────────┬────────────┐
│ problem_id │ title        │ difficulty │ max_score │ contest_id │
├────────────┼──────────────┼────────────┼───────────┼────────────┤
│ 1          │ Sum          │ Easy       │ 100       │ 10         │
│ 2          │ Sort         │ Medium     │ 200       │ 10         │
└────────────┴──────────────┴────────────┴───────────┴────────────┘
PK: problem_id
FK: contest_id → Contests(contest_id) ON DELETE CASCADE

Test_Cases (Weak Entity - depends on Problems)
┌──────────────┬────────────┬───────────────┬─────────────────┬───────────┬────────┐
│ test_case_id │ problem_id │ input         │ expected_output │ is_sample │ points │
├──────────────┼────────────┼───────────────┼─────────────────┼───────────┼────────┤
│ 1            │ 1          │ 5 3           │ 8               │ 1         │ 10     │
│ 2            │ 1          │ 10 20         │ 30              │ 0         │ 20     │
│ 3            │ 2          │ 3 1 2         │ 1 2 3           │ 1         │ 15     │
└──────────────┴────────────┴───────────────┴─────────────────┴───────────┴────────┘
PK: test_case_id
FK: problem_id → Problems(problem_id) ON DELETE CASCADE
```

**Final Improvements:**
✅ Surrogate key (test_case_id) for better performance
✅ Weak entity relationship (test case cannot exist without problem)
✅ CASCADE delete ensures orphaned test cases are removed
✅ Added points attribute for granular scoring
✅ No transitive dependencies

---

### Summary: CodeArena Database - 3NF Achievement

#### All Tables in Third Normal Form (3NF) ✓

| Table                    | 1NF | 2NF | 3NF | Notes                                    |
| ------------------------ | --- | --- | --- | ---------------------------------------- |
| **users**                | ✅  | ✅  | ✅  | All attributes depend only on user_id    |
| **contests**             | ✅  | ✅  | ✅  | All attributes depend only on contest_id |
| **problems**             | ✅  | ✅  | ✅  | Properly references contests             |
| **test_cases**           | ✅  | ✅  | ✅  | Weak entity, depends on problems         |
| **submissions**          | ✅  | ✅  | ✅  | Junction of users and problems           |
| **contest_participants** | ✅  | ✅  | ✅  | M:N relationship resolver                |
| **user_activities**      | ✅  | ✅  | ⚠️  | Denormalized for performance\*           |

**Justification for Denormalization:**

- `user_activities` stores snapshot data (problem_title, contest_title)
- Trade-off: Slight redundancy for 10x faster activity feed queries
- Activity feeds are read-heavy (viewed frequently, updated rarely)
- Titles rarely change, so data staleness is minimal

---

### Normalization Benefits Achieved

✅ **Data Integrity:**

- No duplicate data (except justified denormalization)
- Foreign key constraints enforce relationships
- CASCADE delete prevents orphaned records

✅ **Query Efficiency:**

- Proper indexes on foreign keys
- JOIN operations well-optimized
- Views aggregate data without redundancy

✅ **Maintenance:**

- Single source of truth for each entity
- Updates in one place reflect everywhere
- Triggers maintain computed values

✅ **Flexibility:**

- Easy to add new attributes
- Can extend relationships without restructuring
- Scalable design for future features

### Design Decisions

1. **Denormalization in USER_ACTIVITIES**:

   - Stores snapshots of problem/contest titles
   - Justification: Activity feeds require high read performance, and titles rarely change
   - Trade-off: Slight redundancy for significant performance gain

2. **User Statistics in USERS table**:

   - Could be calculated from submissions
   - Stored for performance: Leaderboards and profile views are frequent
   - Updated via triggers to maintain consistency

3. **Contest Status**:
   - Calculated dynamically using VIEW instead of stored column
   - Always accurate, no maintenance required

---

## Database Constraints

### Primary Key Constraints

- All tables have primary keys
- Auto-increment used for surrogate keys

### Foreign Key Constraints

- All relationships enforced with foreign keys
- CASCADE DELETE for dependent entities
- SET NULL for optional relationships

### Unique Constraints

- `users.username` UNIQUE
- `users.email` UNIQUE
- `(user_id, contest_id)` UNIQUE in contest_participants

### Check Constraints

- `contests.end_time` > `contests.start_time`

### Default Values

- Timestamps default to CURRENT_TIMESTAMP
- Counters default to 0
- Boolean flags default to FALSE

---

## Views

### 1. contest_status_view

- Real-time contest status (active/upcoming/ended)
- Includes participant count

### 2. problem_stats_view

- Problem details with acceptance rates
- Test case counts
- Contest information

### 3. leaderboard_view

- User rankings by points and problems solved
- Calculated ranks using window functions

### 4. submission_history_view

- Complete submission details with user/problem/contest info
- Ordered by submission time

---

## Stored Procedures

### 1. update_user_stats_after_submission

- Updates user statistics after code submission
- Handles first-time solves
- Tracks contest participation

### 2. update_problem_stats_after_submission

- Updates problem submission/acceptance counts

### 3. add_user_activity

- Adds activity to user feed
- Maintains only last 10 activities per user

---

## Triggers

### 1. after_problem_insert

- Auto-updates contest problem count when problem added

### 2. after_problem_delete

- Auto-updates contest problem count when problem deleted

### 3. after_submission_insert

- Automatically updates all related statistics
- Calls stored procedures for user/problem stats
- Adds activity record

---

## Indexes for Performance

### Primary Indexes

- All primary keys automatically indexed

### Single Column Indexes

- `users.username`, `users.email`
- `contests.start_time`, `contests.end_time`
- `problems.contest_id`, `problems.difficulty`
- `submissions.user_id`, `submissions.problem_id`, `submissions.contest_id`

### Composite Indexes

- `(user_id, contest_id, status, points_earned)` on submissions
- `(difficulty, accepted_submissions, total_submissions)` on problems
- `(start_time, end_time)` on contests
- `(user_id, activity_timestamp DESC)` on user_activities

### Covering Indexes

- Leaderboard queries: `(total_points DESC, problems_solved DESC)`
- Submission history: `(submitted_at DESC)`

---

## Firebase to MySQL Mapping

| Firebase Collection              | MySQL Table           | Notes                                   |
| -------------------------------- | --------------------- | --------------------------------------- |
| users                            | users                 | Direct mapping with flattened structure |
| contests                         | contests              | Timestamp conversion to DATETIME        |
| problems                         | problems + test_cases | Separated test cases into own table     |
| submissions                      | submissions           | Direct mapping                          |
| N/A                              | contest_participants  | New table for many-to-many relationship |
| recentActivities (subcollection) | user_activities       | Converted to separate table             |

### Key Conversions

- Firebase UID → VARCHAR(128) for compatibility
- Firestore Timestamps → MySQL DATETIME/TIMESTAMP
- Nested arrays → Separate tables (normalized)
- Document references → Foreign keys
- Subcollections → Related tables with foreign keys

---

## End of ER Diagram Documentation
