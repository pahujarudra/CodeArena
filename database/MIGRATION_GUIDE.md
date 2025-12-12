# Firebase to MySQL Migration Guide

## ✅ Migration Status: COMPLETED (December 2025)

**The CodeArena platform has been successfully migrated from Firebase to MySQL.**

This document now serves as a reference for the completed migration process.

---

## Table of Contents

1. [Migration Overview](#migration-overview)
2. [What Was Accomplished](#what-was-accomplished)
3. [Architecture Comparison](#architecture-comparison)
4. [Data Model Mapping](#data-model-mapping)
5. [Query Conversion Examples](#query-conversion-examples)
6. [Application Code Changes](#application-code-changes)
7. [Performance Considerations](#performance-considerations)

---

## Migration Overview

### Completed Migration

✅ **Database**: Firebase Firestore → MySQL 8.0+
✅ **Backend**: Firebase SDK → Express.js REST API (30+ endpoints)
✅ **Authentication**: Firebase Auth → JWT + bcrypt
✅ **Storage**: Firestore collections → 7 MySQL tables
✅ **Frontend**: All pages migrated to use REST API
✅ **Data**: Sample data loaded (4 contests, 10 problems, test cases)

### Why MySQL?

- **ACID Compliance**: Strong consistency and transaction support ✅
- **Complex Queries**: Better support for joins and aggregations ✅
- **Academic Requirement**: Required for DBMS course project ✅
- **Relational Integrity**: Enforced foreign key constraints ✅
- **Cost**: Free (self-hosted) vs Firebase pay-per-operation ✅

---

## What Was Accomplished

### Backend Implementation

- ✅ Express.js server with MySQL2 connection pool
- ✅ 30+ REST API endpoints (auth, users, contests, problems, submissions)
- ✅ JWT authentication with 7-day expiration
- ✅ bcrypt password hashing
- ✅ Input validation with express-validator
- ✅ CORS configuration for local development
- ✅ Error handling middleware

### Database Implementation

- ✅ 7 normalized tables (3NF)
- ✅ 12 foreign key constraints with CASCADE delete
- ✅ 4 views for complex queries
- ✅ 3 triggers for automatic updates
- ✅ 3 stored procedures for business logic
- ✅ 20+ indexes for performance
- ✅ Sample data with 4 contests and 10 problems

### Frontend Migration

- ✅ All 6 pages migrated (Profile, Home, Contests, ContestDetails, ProblemSolver, Admin)
- ✅ All 5 modals migrated (Login, Signup, EditProfile, AddContest, AddProblem)
- ✅ API utility module with centralized error handling
- ✅ Authentication context using JWT tokens
- ✅ Judge0 API integration for code execution

### Code Cleanup

- ✅ Firebase package uninstalled
- ✅ Firebase configuration files deleted
- ✅ All Firebase imports removed
- ✅ Error handling utilities removed

---

## Architecture Comparison

### OLD: Firebase Firestore Architecture

```
┌─────────────────────────────────────┐
│         Firebase Cloud              │
│  ┌──────────────────────────────┐  │
│  │  Firestore (NoSQL)           │  │
│  │  - Document-based            │  │
│  │  - Nested collections        │  │
│  │  - Real-time sync            │  │
│  │  - Automatic indexing        │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  Firebase Auth               │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
           ↕
    ┌──────────────┐
    │  React App   │
    └──────────────┘
```

### NEW: MySQL Architecture (CURRENT) ✅

```
┌─────────────────────────────────────┐
│      Application Server             │
│  ┌──────────────────────────────┐  │
│  │  Express.js 4.18.2           │  │
│  │  - REST API (30+ endpoints)  │  │
│  │  - JWT Authentication        │  │
│  │  - bcrypt Password Hashing   │  │
│  │  - express-validator         │  │
│  └──────────────────────────────┘  │
│         Port: 5001                  │
└─────────────────────────────────────┘
           ↕ HTTP/JSON
┌─────────────────────────────────────┐
│      MySQL Database Server          │
│  ┌──────────────────────────────┐  │
│  │  MySQL 9.3.0 (Relational)    │  │
│  │  - 7 normalized tables       │  │
│  │  - Foreign keys + CASCADE    │  │
│  │  - 4 Views                   │  │
│  │  - 3 Triggers                │  │
│  │  - 3 Stored Procedures       │  │
│  └──────────────────────────────┘  │
│   Database: codearena               │
└─────────────────────────────────────┘
           ↕ HTTP/JSON
    ┌──────────────┐
    │  React App   │
    │  Vite 7.2.2  │
    │  Port: 5173  │
    └──────────────┘
```

---

## Data Model Mapping

### 1. Users Collection → users Table ✅

**Firebase Structure (OLD):**

```javascript
users/{userId}
{
  fullname: "John Doe",
  username: "john_doe",
  email: "john@example.com",
  photoURL: "https://...",
  isAdmin: false,
  problemsSolved: 15,
  totalPoints: 1250,
  totalSubmissions: 45,
  contestsParticipated: 3,
  problemsByDifficulty: {
    easy: 8,
    medium: 5,
    hard: 2
  },
  createdAt: Timestamp,
  recentActivities: [
    {
      problemId: "prob123",
      problemTitle: "Two Sum",
      status: "Accepted",
      submittedAt: Timestamp
    }
  ]
}
```

**MySQL Structure:**

```sql
-- users table (main data)
INSERT INTO users (
  user_id, fullname, username, email, photo_url, is_admin,
  problems_solved, total_points, total_submissions, contests_participated,
  easy_problems_solved, medium_problems_solved, hard_problems_solved,
  created_at
) VALUES (
  'userId', 'John Doe', 'john_doe', 'john@example.com', 'https://...', 0,
  15, 1250, 45, 3, 8, 5, 2, '2025-01-01 10:00:00'
);

-- user_activities table (separate table)
INSERT INTO user_activities (
  user_id, problem_id, problem_title, status, activity_timestamp
) VALUES (
  'userId', 'prob123', 'Two Sum', 'Accepted', '2025-12-10 14:30:00'
);
```

**Key Changes:**

- Nested `problemsByDifficulty` → Flattened columns
- Array `recentActivities` → Separate `user_activities` table
- Firebase Timestamp → MySQL DATETIME/TIMESTAMP

---

### 2. Contests Collection → contests Table

**Firebase Structure:**

```javascript
contests/{contestId}
{
  title: "Weekly Contest #10",
  description: "Solve algorithmic problems...",
  startTime: Timestamp,
  endTime: Timestamp,
  problemCount: 5,
  createdAt: Timestamp
}
```

**MySQL Structure:**

```sql
INSERT INTO contests (
  title, description, start_time, end_time, problem_count, created_at
) VALUES (
  'Weekly Contest #10',
  'Solve algorithmic problems...',
  '2025-12-15 10:00:00',
  '2025-12-15 12:00:00',
  5,
  '2025-12-01 09:00:00'
);
```

**Key Changes:**

- Auto-generated `contest_id` instead of document ID
- Timestamp conversion

---

### 3. Problems Collection → problems + test_cases Tables

**Firebase Structure:**

```javascript
problems/{problemId}
{
  contestId: "contest123",
  title: "Two Sum",
  description: "Given an array...",
  difficulty: "Easy",
  points: 100,
  timeLimit: 1000,
  memoryLimit: 256,
  constraints: "1 <= n <= 10^4",
  inputFormat: "First line contains n...",
  outputFormat: "Print sum...",
  sampleInput: "4\n2 7 11 15",
  sampleOutput: "9 18",
  testCases: [
    {
      input: "4\n2 7 11 15",
      output: "9 18",
      isHidden: false
    },
    {
      input: "100\n...",
      output: "...",
      isHidden: true
    }
  ],
  totalSubmissions: 150,
  acceptedSubmissions: 75,
  createdAt: Timestamp
}
```

**MySQL Structure:**

```sql
-- problems table
INSERT INTO problems (
  contest_id, title, description, difficulty, points,
  time_limit, memory_limit, constraints, input_format, output_format,
  sample_input, sample_output, total_submissions, accepted_submissions
) VALUES (
  1, 'Two Sum', 'Given an array...', 'Easy', 100,
  1000, 256, '1 <= n <= 10^4', 'First line contains n...', 'Print sum...',
  '4\n2 7 11 15', '9 18', 150, 75
);

-- test_cases table (normalized)
INSERT INTO test_cases (problem_id, input_data, expected_output, is_hidden, test_order)
VALUES
  (1, '4\n2 7 11 15', '9 18', 0, 1),
  (1, '100\n...', '...', 1, 2);
```

**Key Changes:**

- Array `testCases` → Separate `test_cases` table (normalization)
- Document reference `contestId` → Foreign key `contest_id`

---

### 4. Submissions Collection → submissions Table

**Firebase Structure:**

```javascript
submissions/{submissionId}
{
  userId: "user123",
  username: "john_doe",
  problemId: "prob123",
  problemTitle: "Two Sum",
  contestId: "contest123",
  contestTitle: "Weekly Contest #10",
  code: "class Solution { ... }",
  language: "java",
  status: "Accepted",
  passedTests: 10,
  totalTests: 10,
  points: 100,
  difficulty: "Easy",
  submittedAt: Timestamp
}
```

**MySQL Structure:**

```sql
INSERT INTO submissions (
  user_id, problem_id, contest_id, code, language,
  status, passed_tests, total_tests, points_earned, submitted_at
) VALUES (
  'user123', 1, 1, 'class Solution { ... }', 'java',
  'Accepted', 10, 10, 100, '2025-12-10 14:30:00'
);
```

**Key Changes:**

- Removed redundant `username`, `problemTitle`, `contestTitle` (can JOIN)
- Document IDs → Foreign keys

---

### 5. New Table: contest_participants

**Firebase Approach:**

```javascript
// Tracked implicitly through submissions
// OR as array in user document
participatedContests: ["contest1", "contest2"];
```

**MySQL Approach:**

```sql
-- Explicit many-to-many relationship
CREATE TABLE contest_participants (
  participation_id INT PRIMARY KEY,
  user_id VARCHAR(128),
  contest_id INT,
  joined_at TIMESTAMP,
  UNIQUE KEY (user_id, contest_id)
);
```

**Benefits:**

- Explicit participation tracking
- Join timestamp
- Prevents duplicates
- Easy to query participants

---

## Migration Steps

### Step 1: Setup MySQL Database

```bash
# Install MySQL (macOS)
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation
mysql_secure_installation

# Create database
mysql -u root -p
CREATE DATABASE codearena;
USE codearena;

# Run schema
SOURCE /path/to/mysql_schema.sql;
```

### Step 2: Export Firebase Data

```javascript
// export-firebase-data.js
const admin = require("firebase-admin");
const fs = require("fs");

admin.initializeApp({
  credential: admin.credential.cert("./serviceAccountKey.json"),
});

const db = admin.firestore();

async function exportCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const data = [];

  snapshot.forEach((doc) => {
    data.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  fs.writeFileSync(`${collectionName}.json`, JSON.stringify(data, null, 2));

  console.log(`Exported ${data.length} documents from ${collectionName}`);
}

async function exportAll() {
  await exportCollection("users");
  await exportCollection("contests");
  await exportCollection("problems");
  await exportCollection("submissions");
}

exportAll();
```

### Step 3: Transform and Import Data

```javascript
// import-to-mysql.js
const mysql = require("mysql2/promise");
const fs = require("fs");

async function importUsers() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "your_password",
    database: "codearena",
  });

  const users = JSON.parse(fs.readFileSync("users.json"));

  for (const user of users) {
    await connection.execute(
      `INSERT INTO users (
        user_id, username, fullname, email, photo_url, is_admin,
        problems_solved, total_points, total_submissions, contests_participated,
        easy_problems_solved, medium_problems_solved, hard_problems_solved,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.username,
        user.fullname,
        user.email,
        user.photoURL || null,
        user.isAdmin || false,
        user.problemsSolved || 0,
        user.totalPoints || 0,
        user.totalSubmissions || 0,
        user.contestsParticipated || 0,
        user.problemsByDifficulty?.easy || 0,
        user.problemsByDifficulty?.medium || 0,
        user.problemsByDifficulty?.hard || 0,
        user.createdAt?._seconds
          ? new Date(user.createdAt._seconds * 1000)
          : new Date(),
      ]
    );

    // Import activities
    if (user.recentActivities) {
      for (const activity of user.recentActivities) {
        await connection.execute(
          `INSERT INTO user_activities (
            user_id, problem_id, problem_title, contest_title,
            status, difficulty, passed_tests, total_tests, activity_timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.id,
            activity.problemId,
            activity.problemTitle,
            activity.contestTitle || "Practice",
            activity.status,
            activity.difficulty,
            activity.passedTests || 0,
            activity.totalTests || 0,
            activity.submittedAt?._seconds
              ? new Date(activity.submittedAt._seconds * 1000)
              : new Date(),
          ]
        );
      }
    }
  }

  console.log(`Imported ${users.length} users`);
  await connection.end();
}

async function importContests() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "your_password",
    database: "codearena",
  });

  const contests = JSON.parse(fs.readFileSync("contests.json"));
  const contestIdMap = new Map(); // Firebase ID → MySQL ID

  for (const contest of contests) {
    const [result] = await connection.execute(
      `INSERT INTO contests (
        title, description, start_time, end_time, problem_count, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        contest.title,
        contest.description,
        new Date(contest.startTime._seconds * 1000),
        new Date(contest.endTime._seconds * 1000),
        contest.problemCount || 0,
        contest.createdAt?._seconds
          ? new Date(contest.createdAt._seconds * 1000)
          : new Date(),
      ]
    );

    contestIdMap.set(contest.id, result.insertId);
  }

  // Save mapping for problems import
  fs.writeFileSync(
    "contest_id_map.json",
    JSON.stringify(Array.from(contestIdMap))
  );

  console.log(`Imported ${contests.length} contests`);
  await connection.end();
}

async function importProblems() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "your_password",
    database: "codearena",
  });

  const problems = JSON.parse(fs.readFileSync("problems.json"));
  const contestIdMap = new Map(
    JSON.parse(fs.readFileSync("contest_id_map.json"))
  );
  const problemIdMap = new Map();

  for (const problem of problems) {
    const mysqlContestId = contestIdMap.get(problem.contestId);

    const [result] = await connection.execute(
      `INSERT INTO problems (
        contest_id, title, description, difficulty, points,
        time_limit, memory_limit, constraints, input_format, output_format,
        sample_input, sample_output, total_submissions, accepted_submissions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mysqlContestId,
        problem.title,
        problem.description,
        problem.difficulty,
        problem.points,
        problem.timeLimit,
        problem.memoryLimit,
        problem.constraints,
        problem.inputFormat,
        problem.outputFormat,
        problem.sampleInput,
        problem.sampleOutput,
        problem.totalSubmissions || 0,
        problem.acceptedSubmissions || 0,
      ]
    );

    const mysqlProblemId = result.insertId;
    problemIdMap.set(problem.id, mysqlProblemId);

    // Import test cases
    if (problem.testCases) {
      for (let i = 0; i < problem.testCases.length; i++) {
        const tc = problem.testCases[i];
        await connection.execute(
          `INSERT INTO test_cases (
            problem_id, input_data, expected_output, is_hidden, test_order
          ) VALUES (?, ?, ?, ?, ?)`,
          [mysqlProblemId, tc.input, tc.output, tc.isHidden || false, i + 1]
        );
      }
    }
  }

  fs.writeFileSync(
    "problem_id_map.json",
    JSON.stringify(Array.from(problemIdMap))
  );
  console.log(`Imported ${problems.length} problems`);
  await connection.end();
}

async function importSubmissions() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "your_password",
    database: "codearena",
  });

  const submissions = JSON.parse(fs.readFileSync("submissions.json"));
  const problemIdMap = new Map(
    JSON.parse(fs.readFileSync("problem_id_map.json"))
  );
  const contestIdMap = new Map(
    JSON.parse(fs.readFileSync("contest_id_map.json"))
  );

  for (const sub of submissions) {
    const mysqlProblemId = problemIdMap.get(sub.problemId);
    const mysqlContestId = sub.contestId
      ? contestIdMap.get(sub.contestId)
      : null;

    await connection.execute(
      `INSERT INTO submissions (
        user_id, problem_id, contest_id, code, language,
        status, passed_tests, total_tests, points_earned, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sub.userId,
        mysqlProblemId,
        mysqlContestId,
        sub.code,
        sub.language,
        sub.status,
        sub.passedTests,
        sub.totalTests,
        sub.points || 0,
        sub.submittedAt?._seconds
          ? new Date(sub.submittedAt._seconds * 1000)
          : new Date(),
      ]
    );
  }

  console.log(`Imported ${submissions.length} submissions`);
  await connection.end();
}

async function migrateAll() {
  await importUsers();
  await importContests();
  await importProblems();
  await importSubmissions();
  console.log("Migration complete!");
}

migrateAll();
```

### Step 4: Verify Data Integrity

```sql
-- Check record counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'contests', COUNT(*) FROM contests
UNION ALL
SELECT 'problems', COUNT(*) FROM problems
UNION ALL
SELECT 'test_cases', COUNT(*) FROM test_cases
UNION ALL
SELECT 'submissions', COUNT(*) FROM submissions
UNION ALL
SELECT 'user_activities', COUNT(*) FROM user_activities;

-- Verify foreign key integrity
SELECT COUNT(*) FROM problems WHERE contest_id NOT IN (SELECT contest_id FROM contests);
SELECT COUNT(*) FROM submissions WHERE user_id NOT IN (SELECT user_id FROM users);
SELECT COUNT(*) FROM submissions WHERE problem_id NOT IN (SELECT problem_id FROM problems);

-- Check for orphaned records
SELECT * FROM test_cases WHERE problem_id NOT IN (SELECT problem_id FROM problems);
```

---

## Query Conversion Examples

### Example 1: Get User Profile

**Firebase:**

```javascript
const userDoc = await getDoc(doc(db, "users", userId));
const userData = userDoc.data();
```

**MySQL:**

```sql
SELECT * FROM users WHERE user_id = 'user123';
```

**Node.js with MySQL:**

```javascript
const [rows] = await connection.execute(
  "SELECT * FROM users WHERE user_id = ?",
  [userId]
);
const userData = rows[0];
```

---

### Example 2: Get Contest with Problems

**Firebase:**

```javascript
// Get contest
const contestDoc = await getDoc(doc(db, "contests", contestId));
const contest = contestDoc.data();

// Get problems
const problemsQuery = query(
  collection(db, "problems"),
  where("contestId", "==", contestId)
);
const problemsSnap = await getDocs(problemsQuery);
const problems = problemsSnap.docs.map((doc) => doc.data());
```

**MySQL:**

```sql
-- Single query with JOIN
SELECT
  c.*,
  p.problem_id,
  p.title as problem_title,
  p.difficulty,
  p.points
FROM contests c
LEFT JOIN problems p ON c.contest_id = p.contest_id
WHERE c.contest_id = 1;
```

**Node.js:**

```javascript
const [rows] = await connection.execute(
  `
  SELECT 
    c.*,
    JSON_ARRAYAGG(
      JSON_OBJECT(
        'problem_id', p.problem_id,
        'title', p.title,
        'difficulty', p.difficulty,
        'points', p.points
      )
    ) as problems
  FROM contests c
  LEFT JOIN problems p ON c.contest_id = p.contest_id
  WHERE c.contest_id = ?
  GROUP BY c.contest_id
`,
  [contestId]
);
```

---

### Example 3: Get Leaderboard

**Firebase:**

```javascript
const usersSnap = await getDocs(collection(db, "users"));
const users = usersSnap.docs.map((doc) => doc.data());
users.sort((a, b) => b.totalPoints - a.totalPoints);
const leaderboard = users.slice(0, 10);
```

**MySQL:**

```sql
SELECT
  user_id,
  username,
  fullname,
  problems_solved,
  total_points,
  RANK() OVER (ORDER BY total_points DESC, problems_solved DESC) as rank
FROM users
ORDER BY total_points DESC, problems_solved DESC
LIMIT 10;

-- Or use the view
SELECT * FROM leaderboard_view LIMIT 10;
```

---

### Example 4: Submit Solution

**Firebase:**

```javascript
// Add submission
await addDoc(collection(db, "submissions"), submissionData);

// Update user stats
await updateDoc(doc(db, "users", userId), {
  totalSubmissions: increment(1),
  problemsSolved: increment(1),
  totalPoints: increment(points),
});

// Update problem stats
await updateDoc(doc(db, "problems", problemId), {
  totalSubmissions: increment(1),
  acceptedSubmissions: increment(1),
});
```

**MySQL:**

```sql
-- Insert submission (trigger handles stats update automatically)
INSERT INTO submissions (
  user_id, problem_id, contest_id, code, language,
  status, passed_tests, total_tests, points_earned
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Stats are updated by trigger 'after_submission_insert'
```

**Node.js:**

```javascript
// Just insert - triggers handle the rest!
await connection.execute(
  `
  INSERT INTO submissions (
    user_id, problem_id, contest_id, code, language,
    status, passed_tests, total_tests, points_earned
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`,
  [
    userId,
    problemId,
    contestId,
    code,
    language,
    status,
    passedTests,
    totalTests,
    pointsEarned,
  ]
);
```

---

### Example 5: Get User's Recent Activities

**Firebase:**

```javascript
const userDoc = await getDoc(doc(db, "users", userId));
const activities = userDoc.data().recentActivities || [];
```

**MySQL:**

```sql
SELECT
  activity_id,
  problem_title,
  contest_title,
  status,
  difficulty,
  passed_tests,
  total_tests,
  activity_timestamp
FROM user_activities
WHERE user_id = ?
ORDER BY activity_timestamp DESC
LIMIT 10;
```

---

## Application Code Changes

### 1. Replace Firebase SDK with MySQL Client

**Before (Firebase):**

```javascript
import { db } from "./firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
```

**After (MySQL):**

```javascript
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

---

### 2. Create API Layer

```javascript
// api/contests.js
import { pool } from "./database";

export async function getContests() {
  const [rows] = await pool.execute(`
    SELECT * FROM contest_status_view
    ORDER BY start_time DESC
  `);
  return rows;
}

export async function getContestById(contestId) {
  const [rows] = await pool.execute(
    `
    SELECT c.*, 
           COUNT(DISTINCT cp.user_id) as participant_count
    FROM contests c
    LEFT JOIN contest_participants cp ON c.contest_id = cp.contest_id
    WHERE c.contest_id = ?
    GROUP BY c.contest_id
  `,
    [contestId]
  );

  if (rows.length === 0) return null;

  const contest = rows[0];

  // Get problems
  const [problems] = await pool.execute(
    `
    SELECT * FROM problems
    WHERE contest_id = ?
    ORDER BY points ASC
  `,
    [contestId]
  );

  contest.problems = problems;
  return contest;
}

export async function createContest(contestData) {
  const [result] = await pool.execute(
    `
    INSERT INTO contests (title, description, start_time, end_time)
    VALUES (?, ?, ?, ?)
  `,
    [
      contestData.title,
      contestData.description,
      contestData.startTime,
      contestData.endTime,
    ]
  );

  return result.insertId;
}
```

---

### 3. Update React Components

**Before:**

```jsx
// pages/Contests.jsx
const [contests, setContests] = useState([]);

useEffect(() => {
  const loadContests = async () => {
    const snap = await getDocs(collection(db, "contests"));
    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setContests(list);
  };
  loadContests();
}, []);
```

**After:**

```jsx
// pages/Contests.jsx
const [contests, setContests] = useState([]);

useEffect(() => {
  const loadContests = async () => {
    const response = await fetch("/api/contests");
    const data = await response.json();
    setContests(data);
  };
  loadContests();
}, []);
```

---

### 4. Create Express API Routes

```javascript
// server.js
import express from "express";
import cors from "cors";
import * as contestsAPI from "./api/contests.js";
import * as problemsAPI from "./api/problems.js";
import * as submissionsAPI from "./api/submissions.js";

const app = express();

app.use(cors());
app.use(express.json());

// Contests
app.get("/api/contests", async (req, res) => {
  try {
    const contests = await contestsAPI.getContests();
    res.json(contests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/contests/:id", async (req, res) => {
  try {
    const contest = await contestsAPI.getContestById(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found" });
    }
    res.json(contest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/contests", async (req, res) => {
  try {
    const contestId = await contestsAPI.createContest(req.body);
    res.status(201).json({ contestId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Problems
app.get("/api/problems/:id", async (req, res) => {
  try {
    const problem = await problemsAPI.getProblemById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submissions
app.post("/api/submissions", async (req, res) => {
  try {
    const submissionId = await submissionsAPI.createSubmission(req.body);
    res.status(201).json({ submissionId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("API server running on http://localhost:3000");
});
```

---

## Performance Considerations

### 1. Connection Pooling

```javascript
// Use connection pooling for better performance
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "password",
  database: "codearena",
});
```

### 2. Prepared Statements

```javascript
// Always use prepared statements to prevent SQL injection
const [rows] = await connection.execute(
  "SELECT * FROM users WHERE user_id = ?",
  [userId]
);
```

### 3. Indexes

```sql
-- Ensure proper indexes for frequent queries
CREATE INDEX idx_user_contest ON submissions(user_id, contest_id);
CREATE INDEX idx_problem_difficulty ON problems(difficulty, accepted_submissions);
```

### 4. Query Optimization

```sql
-- Use EXPLAIN to analyze queries
EXPLAIN SELECT * FROM submission_history_view WHERE user_id = 'user123';

-- Use covering indexes
CREATE INDEX idx_leaderboard ON users(total_points DESC, problems_solved DESC, username);
```

### 5. Caching Strategy

```javascript
// Use Redis for frequently accessed data
import Redis from "ioredis";
const redis = new Redis();

async function getLeaderboard() {
  const cached = await redis.get("leaderboard");
  if (cached) return JSON.parse(cached);

  const [rows] = await pool.execute("SELECT * FROM leaderboard_view LIMIT 100");
  await redis.setex("leaderboard", 300, JSON.stringify(rows)); // Cache 5 mins
  return rows;
}
```

---

## Testing

### 1. Unit Tests

```javascript
// tests/api.test.js
import { describe, it, expect } from "vitest";
import * as contestsAPI from "../api/contests";

describe("Contests API", () => {
  it("should fetch all contests", async () => {
    const contests = await contestsAPI.getContests();
    expect(contests).toBeInstanceOf(Array);
  });

  it("should fetch contest by ID", async () => {
    const contest = await contestsAPI.getContestById(1);
    expect(contest).toHaveProperty("title");
    expect(contest).toHaveProperty("problems");
  });
});
```

### 2. Integration Tests

```javascript
// tests/integration.test.js
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { pool } from "../database";

describe("Database Integration", () => {
  beforeAll(async () => {
    // Setup test data
    await pool.execute('DELETE FROM submissions WHERE user_id LIKE "test_%"');
  });

  afterAll(async () => {
    // Cleanup
    await pool.execute('DELETE FROM submissions WHERE user_id LIKE "test_%"');
    await pool.end();
  });

  it("should create submission and update stats", async () => {
    await pool.execute(`
      INSERT INTO submissions (
        user_id, problem_id, code, language, status,
        passed_tests, total_tests, points_earned
      ) VALUES ('test_user', 1, 'code', 'java', 'Accepted', 10, 10, 100)
    `);

    const [rows] = await pool.execute(
      "SELECT total_submissions FROM users WHERE user_id = ?",
      ["test_user"]
    );

    expect(rows[0].total_submissions).toBeGreaterThan(0);
  });
});
```

---

## Deployment

### 1. Environment Variables

```bash
# .env
DB_HOST=localhost
DB_USER=codearena_user
DB_PASSWORD=secure_password
DB_NAME=codearena
DB_PORT=3306

JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

### 2. Docker Setup

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: "3.8"

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: codearena
      MYSQL_USER: codearena_user
      MYSQL_PASSWORD: secure_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/mysql_schema.sql:/docker-entrypoint-initdb.d/schema.sql

  api:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - mysql
    environment:
      DB_HOST: mysql
      DB_USER: codearena_user
      DB_PASSWORD: secure_password
      DB_NAME: codearena

volumes:
  mysql_data:
```

---

## Conclusion

This migration guide provides a comprehensive roadmap for converting CodeArena from Firebase to MySQL. The key benefits include:

✅ **Strong Data Integrity**: Foreign key constraints ensure referential integrity
✅ **Complex Queries**: JOIN operations enable powerful data relationships
✅ **ACID Compliance**: Transactions ensure data consistency
✅ **Academic Standard**: Meets DBMS course requirements
✅ **Performance**: Proper indexing and optimization for fast queries
✅ **Scalability**: Connection pooling and caching strategies

The migration preserves all functionality while providing better structure and query capabilities for your DBMS academic report.

---

**End of Migration Guide**
