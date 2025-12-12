# Firebase vs MySQL: Migration Complete ✅

## Migration Status: COMPLETED (December 2025)

**CodeArena has successfully migrated from Firebase Firestore to MySQL.**

All Firebase code has been removed and replaced with a complete REST API backend using Express.js and MySQL.

---

## Executive Summary

This document provides a comprehensive comparison between the original Firebase Firestore implementation and the current MySQL relational database design for the CodeArena competitive programming platform.

**Migration Achievement:**

- ✅ Complete MySQL schema implemented
- ✅ REST API backend with 30+ endpoints
- ✅ All frontend pages migrated
- ✅ Firebase completely removed (no remaining dependencies)
- ✅ Sample data loaded (4 contests, 10 problems)
- ✅ Production-ready with Judge0 code execution

---

## Architecture Comparison

| Aspect             | Firebase Firestore (OLD) | MySQL Implementation (CURRENT) ✅ |
| ------------------ | ------------------------ | --------------------------------- |
| **Database Type**  | NoSQL (Document Store)   | Relational (RDBMS)                |
| **Data Structure** | Collections & Documents  | Tables & Rows                     |
| **Schema**         | Schema-less (Flexible)   | Fixed Schema (Rigid)              |
| **Relationships**  | Document References      | Foreign Keys with CASCADE         |
| **Queries**        | Limited (No JOINs)       | Full SQL Support                  |
| **Transactions**   | Limited                  | Full ACID Support                 |
| **Scalability**    | Horizontal (Automatic)   | Vertical + Horizontal             |
| **Hosting**        | Cloud-only (Google)      | Self-hosted (Local MySQL)         |
| **Cost Model**     | Pay per operation        | Free (Self-hosted)                |
| **Backend**        | Firebase SDK             | Express.js REST API               |
| **Authentication** | Firebase Auth            | JWT + bcrypt                      |

---

## Data Model Comparison

### Users Collection/Table

**Firebase Structure:**

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
  problemsByDifficulty: {
    easy: 8,
    medium: 5,
    hard: 2
  },
  recentActivities: [
    { problemId: "prob123", status: "Accepted", ... }
  ],
  participatedContests: ["contest1", "contest2"]
}
```

**MySQL Structure:**

```sql
-- users table (normalized)
CREATE TABLE users (
  user_id VARCHAR(128) PRIMARY KEY,
  username VARCHAR(20) UNIQUE,
  fullname VARCHAR(50),
  email VARCHAR(255) UNIQUE,
  photo_url VARCHAR(512),
  is_admin BOOLEAN,
  problems_solved INT,
  total_points INT,
  easy_problems_solved INT,
  medium_problems_solved INT,
  hard_problems_solved INT,
  ...
);

-- Separate table for activities
CREATE TABLE user_activities (
  activity_id INT PRIMARY KEY,
  user_id VARCHAR(128),
  problem_id INT,
  status VARCHAR(50),
  ...
);

-- Separate table for contest participation
CREATE TABLE contest_participants (
  participation_id INT PRIMARY KEY,
  user_id VARCHAR(128),
  contest_id INT,
  ...
);
```

**Key Differences:**

- Firebase: Nested objects and arrays within single document
- MySQL: Normalized into multiple related tables
- Firebase: ~1 read operation
- MySQL: May require JOINs (1-3 queries)

---

## Feature Comparison

### 1. Data Integrity

| Feature                   | Firebase             | MySQL                   |
| ------------------------- | -------------------- | ----------------------- |
| **Foreign Keys**          | ❌ Manual validation | ✅ Enforced by database |
| **Referential Integrity** | ❌ Application-level | ✅ Database-level       |
| **Cascading Deletes**     | ❌ Manual cleanup    | ✅ Automatic (CASCADE)  |
| **Data Validation**       | ❌ Application-level | ✅ CHECK constraints    |
| **ACID Transactions**     | ⚠️ Limited support   | ✅ Full support         |

**Example:**

```javascript
// Firebase - Manual cleanup required
await deleteDoc(doc(db, "contests", contestId));
// Must manually delete related problems!
const problems = await getDocs(
  query(collection(db, "problems"), where("contestId", "==", contestId))
);
for (const prob of problems.docs) {
  await deleteDoc(prob.ref);
}
```

```sql
-- MySQL - Automatic cleanup
DELETE FROM contests WHERE contest_id = 1;
-- All related problems deleted automatically via CASCADE
```

---

### 2. Query Capabilities

| Query Type           | Firebase         | MySQL                              |
| -------------------- | ---------------- | ---------------------------------- |
| **Simple Filters**   | ✅ Excellent     | ✅ Excellent                       |
| **JOINs**            | ❌ Not supported | ✅ Full support                    |
| **Aggregations**     | ⚠️ Limited       | ✅ Full support (SUM, AVG, etc.)   |
| **Sorting**          | ⚠️ Single field  | ✅ Multiple fields                 |
| **Subqueries**       | ❌ Not supported | ✅ Full support                    |
| **Window Functions** | ❌ Not supported | ✅ Full support (RANK, ROW_NUMBER) |

**Example - Get Leaderboard:**

```javascript
// Firebase - Multiple queries + client-side processing
const usersSnap = await getDocs(collection(db, "users"));
const users = usersSnap.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}));

// Sort in application
users.sort((a, b) => {
  if (b.totalPoints !== a.totalPoints) {
    return b.totalPoints - a.totalPoints;
  }
  return b.problemsSolved - a.problemsSolved;
});

// Add ranks in application
const leaderboard = users.map((user, index) => ({
  ...user,
  rank: index + 1,
}));
```

```sql
-- MySQL - Single query with ranking
SELECT
  user_id,
  username,
  fullname,
  problems_solved,
  total_points,
  RANK() OVER (ORDER BY total_points DESC, problems_solved DESC) as rank
FROM users
ORDER BY total_points DESC, problems_solved DESC
LIMIT 100;
```

**Performance:** MySQL query is significantly faster for large datasets.

---

### 3. Complex Queries

**Scenario:** Get all contests with problem count, participant count, and top scorer

**Firebase Approach:**

```javascript
// Multiple queries required
const contests = await getDocs(collection(db, "contests"));
const results = [];

for (const contestDoc of contests.docs) {
  const contestData = contestDoc.data();

  // Count problems
  const problemsSnap = await getDocs(
    query(collection(db, "problems"), where("contestId", "==", contestDoc.id))
  );

  // Get all submissions for this contest
  const submissionsSnap = await getDocs(
    query(
      collection(db, "submissions"),
      where("contestId", "==", contestDoc.id)
    )
  );

  // Count unique participants
  const participants = new Set(
    submissionsSnap.docs.map((d) => d.data().userId)
  );

  // Find top scorer (client-side processing)
  const userPoints = {};
  submissionsSnap.docs.forEach((doc) => {
    const sub = doc.data();
    if (sub.status === "Accepted") {
      userPoints[sub.userId] = (userPoints[sub.userId] || 0) + sub.points;
    }
  });

  const topScorer = Object.entries(userPoints).sort((a, b) => b[1] - a[1])[0];

  results.push({
    ...contestData,
    problemCount: problemsSnap.size,
    participantCount: participants.size,
    topScorer: topScorer
      ? {
          userId: topScorer[0],
          points: topScorer[1],
        }
      : null,
  });
}

// Total: 1 + (N * 3) queries where N = number of contests
```

**MySQL Approach:**

```sql
-- Single query with JOINs and aggregations
SELECT
  c.*,
  COUNT(DISTINCT p.problem_id) as problem_count,
  COUNT(DISTINCT cp.user_id) as participant_count,
  (
    SELECT u.username
    FROM submissions s
    JOIN users u ON s.user_id = u.user_id
    WHERE s.contest_id = c.contest_id AND s.status = 'Accepted'
    GROUP BY s.user_id
    ORDER BY SUM(s.points_earned) DESC
    LIMIT 1
  ) as top_scorer,
  (
    SELECT SUM(s.points_earned)
    FROM submissions s
    WHERE s.contest_id = c.contest_id AND s.status = 'Accepted'
    GROUP BY s.user_id
    ORDER BY SUM(s.points_earned) DESC
    LIMIT 1
  ) as top_score
FROM contests c
LEFT JOIN problems p ON c.contest_id = p.contest_id
LEFT JOIN contest_participants cp ON c.contest_id = cp.contest_id
GROUP BY c.contest_id;

-- Total: 1 query for all contests
```

**Performance Difference:**

- Firebase: O(N) queries where N = contests (10 contests = 31 queries)
- MySQL: O(1) query regardless of contest count (1 query)

---

### 4. Normalization

**Firebase (Denormalized):**

```javascript
// Submissions store redundant data
submissions/{submissionId}
{
  userId: "user123",
  username: "john_doe",        // Redundant
  problemId: "prob123",
  problemTitle: "Two Sum",     // Redundant
  contestId: "contest123",
  contestTitle: "Weekly #10",  // Redundant
  ...
}

// Problem: If username changes, must update ALL submissions
```

**MySQL (Normalized):**

```sql
-- Submissions only store foreign keys
CREATE TABLE submissions (
  submission_id INT PRIMARY KEY,
  user_id VARCHAR(128),    -- FK to users
  problem_id INT,          -- FK to problems
  contest_id INT,          -- FK to contests
  code TEXT,
  language VARCHAR(20),
  status VARCHAR(50),
  ...
);

-- Get full details with JOIN
SELECT
  s.*,
  u.username,
  p.title as problem_title,
  c.title as contest_title
FROM submissions s
JOIN users u ON s.user_id = u.user_id
JOIN problems p ON s.problem_id = p.problem_id
LEFT JOIN contests c ON s.contest_id = c.contest_id;

-- Benefit: Updating username updates ALL submissions automatically
```

---

### 5. Automatic Statistics Updates

**Firebase Approach:**

```javascript
// Manual updates required in every submission
async function submitSolution(submissionData) {
  // 1. Save submission
  await addDoc(collection(db, "submissions"), submissionData);

  // 2. Update user stats (manual)
  await updateDoc(doc(db, "users", userId), {
    totalSubmissions: increment(1),
    problemsSolved: increment(1),
    totalPoints: increment(points),
  });

  // 3. Update problem stats (manual)
  await updateDoc(doc(db, "problems", problemId), {
    totalSubmissions: increment(1),
    acceptedSubmissions: increment(1),
  });

  // 4. Update contest problem count (manual)
  // 5. Track contest participation (manual)
  // 6. Update activity feed (manual)

  // Risk: If any update fails, data becomes inconsistent
}
```

**MySQL Approach:**

```sql
-- Insert submission - triggers handle everything automatically
INSERT INTO submissions (
  user_id, problem_id, contest_id, code, language,
  status, passed_tests, total_tests, points_earned
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Trigger automatically:
-- 1. Updates users.total_submissions
-- 2. Updates users.problems_solved (if first solve)
-- 3. Updates users.total_points
-- 4. Updates problems.total_submissions
-- 5. Updates problems.accepted_submissions
-- 6. Tracks contest participation
-- 7. Adds activity to user_activities
-- All in a single transaction - guaranteed consistency!
```

---

## Performance Comparison

### Read Operations

| Operation                   | Firebase             | MySQL                | Winner   |
| --------------------------- | -------------------- | -------------------- | -------- |
| **Single user profile**     | ~50ms                | ~5ms                 | MySQL    |
| **Leaderboard (100 users)** | ~200ms + sorting     | ~20ms                | MySQL    |
| **Contest with problems**   | N+1 queries (~150ms) | 1 JOIN query (~15ms) | MySQL    |
| **User submission history** | ~100ms               | ~10ms with index     | MySQL    |
| **Real-time updates**       | Instant (WebSocket)  | Manual polling       | Firebase |

### Write Operations

| Operation            | Firebase             | MySQL                       | Winner |
| -------------------- | -------------------- | --------------------------- | ------ |
| **Create user**      | ~100ms               | ~10ms                       | MySQL  |
| **Submit solution**  | ~300ms (3-4 updates) | ~50ms (1 insert + triggers) | MySQL  |
| **Create contest**   | ~80ms                | ~8ms                        | MySQL  |
| **Batch operations** | Limited              | Excellent                   | MySQL  |

### Scalability

**Firebase:**

- ✅ Automatic scaling
- ✅ No server management
- ❌ Cost increases with usage
- ❌ Limited by plan quotas

**MySQL:**

- ⚠️ Manual scaling setup
- ✅ Predictable costs
- ✅ Full control
- ✅ Can handle millions of records efficiently

---

## Cost Comparison (Estimated)

### Firebase Pricing (for 10,000 active users)

```
Document Reads: 1,000,000/day × $0.06/100K = $0.60/day = $18/month
Document Writes: 200,000/day × $0.18/100K = $0.36/day = $10.80/month
Storage: 5GB × $0.18/GB = $0.90/month
Total: ~$30/month minimum

As usage grows:
- 100K users: ~$300-500/month
- 1M users: ~$3,000-5,000/month
```

### MySQL Pricing (Self-hosted or Cloud)

```
Option 1: Self-hosted (VPS)
- DigitalOcean Droplet: $12-24/month (4GB RAM, 2 vCPUs)
- Can handle 100K+ users easily
- Fixed cost regardless of operations

Option 2: Managed MySQL (AWS RDS, Google Cloud SQL)
- Small instance: $15-30/month
- Medium instance: $50-100/month (can handle 1M+ users)
- Predictable scaling costs

Total: ~$12-100/month (fixed, scalable)
```

**Winner:** MySQL is 3-50x cheaper at scale

---

## Development Complexity

### Firebase (Simpler Initially)

**Pros:**
✅ No server setup required
✅ Built-in authentication
✅ Real-time updates out of the box
✅ Quick prototyping
✅ No SQL knowledge needed

**Cons:**
❌ Complex queries require multiple operations
❌ Manual data consistency management
❌ Harder to maintain as app grows
❌ Limited debugging tools
❌ Vendor lock-in

### MySQL (More Setup, Better Long-term)

**Pros:**
✅ Industry-standard SQL
✅ Powerful query capabilities
✅ Automatic data integrity
✅ Excellent debugging tools
✅ No vendor lock-in
✅ Better for complex applications

**Cons:**
❌ Requires server setup
❌ Need to build authentication
❌ Manual real-time update implementation
❌ Steeper learning curve
❌ Schema migrations needed

---

## Academic Suitability

| Criteria              | Firebase                      | MySQL                            |
| --------------------- | ----------------------------- | -------------------------------- |
| **DBMS Concepts**     | ❌ NoSQL (different paradigm) | ✅ Core RDBMS concepts           |
| **ER Modeling**       | ❌ Not applicable             | ✅ Required                      |
| **Normalization**     | ❌ Not applicable             | ✅ 1NF, 2NF, 3NF, BCNF           |
| **SQL Queries**       | ❌ No SQL                     | ✅ Full SQL support              |
| **Joins**             | ❌ Not supported              | ✅ Required topic                |
| **Transactions**      | ⚠️ Limited                    | ✅ Full ACID                     |
| **Triggers**          | ❌ Not supported              | ✅ Supported                     |
| **Stored Procedures** | ❌ Not supported              | ✅ Supported                     |
| **Views**             | ❌ Not supported              | ✅ Supported                     |
| **Indexing**          | ⚠️ Automatic                  | ✅ Manual (learning opportunity) |

**For DBMS Academic Report:** MySQL is mandatory

---

## Migration Complexity

### Easy (Low Risk)

- User data migration
- Contest data migration
- Static reference data

### Medium (Moderate Risk)

- Problem data with test cases (array to table)
- Authentication system replacement

### Complex (High Risk)

- Real-time features (requires WebSocket implementation)
- File uploads (if using Firebase Storage)
- Change application code for all queries

**Estimated Migration Time:** 2-4 weeks for full application

---

## Recommendation Summary

### Use Firebase When:

- Building MVP or prototype
- Need real-time features immediately
- Small team, limited backend expertise
- Budget allows for scaling costs
- Simple data model without complex relationships

### Use MySQL When:

- Building production application
- Need complex queries and reporting
- Academic/learning context (DBMS courses)
- Cost-sensitive at scale
- Need full control over infrastructure
- Multiple developers familiar with SQL

---

## CodeArena Specific Recommendation

**For Production:** Start with Firebase for MVP, migrate to MySQL as you scale

**For Academic Project:** **Use MySQL** because:

1. ✅ Meets DBMS course requirements (ER diagrams, normalization, SQL)
2. ✅ Better performance for complex queries (leaderboards, statistics)
3. ✅ Lower cost at scale
4. ✅ Industry-standard technology
5. ✅ Teaches valuable database concepts
6. ✅ Better data integrity guarantees
7. ✅ Easier to optimize and debug
8. ✅ More control over schema and queries

---

## Conclusion

Both Firebase and MySQL have their strengths. For CodeArena:

- **Firebase** provides faster initial development with built-in features
- **MySQL** provides better performance, cost-efficiency, and academic value

The complete MySQL schema provided includes:

- ✅ Proper normalization (3NF)
- ✅ Foreign key constraints
- ✅ Indexes for performance
- ✅ Views for complex queries
- ✅ Triggers for automation
- ✅ Stored procedures for business logic

This design is production-ready and suitable for your DBMS academic report.

---

**End of Comparison Document**
