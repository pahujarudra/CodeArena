# Firebase to MySQL Migration Guide

## ✅ Completed

### Backend (100% Complete)

- ✅ Express.js server with MySQL connection
- ✅ JWT authentication system
- ✅ All API endpoints (auth, users, contests, problems, submissions)
- ✅ Backend README and documentation

### Frontend Core (100% Complete)

- ✅ AuthContext - completely rewritten to use REST API
- ✅ API utility file (`src/utils/api.js`) with all backend calls
- ✅ LoginModal - updated to use new auth
- ✅ SignupModal - updated to use new auth
- ✅ Navbar - updated with logout and user display
- ✅ Environment configuration (.env)

## 🚧 Remaining Frontend Components to Update

### 1. Profile Page (`src/pages/Profile.jsx`)

**Firebase code to replace:**

```javascript
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
```

**New code:**

```javascript
import { userAPI } from "../utils/api";
```

**Changes needed:**

- Replace `getDoc(doc(db, "users", userId))` with `userAPI.getById(userId)`
- Replace `updateDoc()` with `userAPI.update(userId, updates)` or use `updateProfile()` from AuthContext
- Update field names: `fullname` → `fullName`, `photoURL` → `avatarUrl`, `uid` → `userId`

### 2. Contests Page (`src/pages/Contests.jsx`)

**Firebase code to replace:**

```javascript
import { db } from "../firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
```

**New code:**

```javascript
import { contestAPI } from "../utils/api";
```

**Changes needed:**

- Replace Firestore queries with `contestAPI.getAll(status)` where status is 'upcoming', 'ongoing', or 'completed'
- Update field names to match backend response (camelCase)
- Use `contestAPI.join(contestId)` for joining contests

### 3. Contest Details Page (`src/pages/ContestDetails.jsx`)

**Changes needed:**

- Use `contestAPI.getById(contestId)` to get contest info
- Use `contestAPI.getLeaderboard(contestId)` for leaderboard
- Use `problemAPI.getAll({ contestId })` to get contest problems

### 4. Admin Page (`src/pages/Admin.jsx`)

**Changes needed:**

- Use `contestAPI.create(contestData)` to create contests
- Use `problemAPI.create(problemData)` to create problems
- Use `problemAPI.addTestCase(problemId, testCaseData)` to add test cases
- Use `contestAPI.delete(contestId)` and `problemAPI.delete(problemId)` for deletions

### 5. Problem Solver Page (`src/pages/ProblemSolver.jsx`)

**Changes needed:**

- Use `problemAPI.getById(problemId)` to get problem details
- Use `submissionAPI.submit({ problemId, code, language })` to submit code
- Use `submissionAPI.getStatus(submissionId)` for polling submission status
- Update UI to show execution time, memory used, score

### 6. Home Page (`src/pages/Home.jsx`)

**Changes needed:**

- Use `userAPI.getAll(sortBy, limit, offset)` for leaderboard
- Use `contestAPI.getAll()` for recent contests
- Update user fields to match new schema

## 📝 Field Name Mapping Reference

### User Fields

| Firebase           | MySQL Backend      |
| ------------------ | ------------------ |
| `uid`              | `userId`           |
| `fullname`         | `fullName`         |
| `photoURL`         | `avatarUrl`        |
| `isAdmin`          | `role === 'admin'` |
| `totalSubmissions` | `totalSubmissions` |
| `totalSolved`      | `totalSolved`      |
| `rating`           | `rating`           |

### Contest Fields

| Firebase       | MySQL Backend         |
| -------------- | --------------------- |
| `id`           | `contestId`           |
| `startTime`    | `startTime`           |
| `endTime`      | `endTime`             |
| `participants` | `currentParticipants` |

### Problem Fields

| Firebase     | MySQL Backend     |
| ------------ | ----------------- |
| `id`         | `problemId`       |
| `difficulty` | `difficulty`      |
| `maxScore`   | `maxScore`        |
| `testCases`  | `sampleTestCases` |

### Submission Fields

| Firebase    | MySQL Backend  |
| ----------- | -------------- |
| `id`        | `submissionId` |
| `userId`    | `userId`       |
| `problemId` | `problemId`    |
| `status`    | `status`       |
| `score`     | `score`        |

## 🔄 Common Patterns

### Pattern 1: Fetching Data

**Before (Firebase):**

```javascript
const docRef = doc(db, "collection", id);
const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
  const data = docSnap.data();
}
```

**After (MySQL Backend):**

```javascript
const data = await api.getById(id);
// Data is already parsed and ready to use
```

### Pattern 2: Creating Data

**Before (Firebase):**

```javascript
const docRef = doc(collection(db, "collection"));
await setDoc(docRef, data);
```

**After (MySQL Backend):**

```javascript
const result = await api.create(data);
const newId = result.id; // or result.contestId, result.problemId, etc.
```

### Pattern 3: Updating Data

**Before (Firebase):**

```javascript
const docRef = doc(db, "collection", id);
await updateDoc(docRef, updates);
```

**After (MySQL Backend):**

```javascript
await api.update(id, updates);
```

### Pattern 4: Querying with Filters

**Before (Firebase):**

```javascript
const q = query(
  collection(db, "contests"),
  where("status", "==", "active"),
  orderBy("startTime", "desc")
);
const querySnapshot = await getDocs(q);
const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
```

**After (MySQL Backend):**

```javascript
const data = await contestAPI.getAll("active");
// Filtering and sorting handled by backend
```

## 🔐 Authentication Changes

### Before (Firebase):

```javascript
const { currentUser } = useAuth();
const userId = currentUser?.uid;
```

### After (MySQL):

```javascript
const { currentUser, isAuthenticated, isAdmin } = useAuth();
const userId = currentUser?.userId;
```

## 🚀 Testing Checklist

Once you complete the component updates:

1. **Start Backend:**

   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**

   ```bash
   npm run dev
   ```

3. **Test Features:**
   - [ ] Signup new user
   - [ ] Login existing user
   - [ ] Update profile
   - [ ] View user profile
   - [ ] View contests list
   - [ ] Join a contest
   - [ ] View contest details
   - [ ] View leaderboard
   - [ ] Create problem (admin)
   - [ ] Create contest (admin)
   - [ ] Solve problem
   - [ ] Submit code
   - [ ] View submission status
   - [ ] View submission history
   - [ ] Logout

## 📦 Final Steps

### 1. Remove Firebase

```bash
# Uninstall Firebase
npm uninstall firebase

# Delete Firebase config file
rm src/firebase.js
```

### 2. Update package.json

Remove Firebase from dependencies.

### 3. Update README

Document the new MySQL-based architecture.

## 🐛 Troubleshooting

### CORS Errors

Make sure backend has CORS configured correctly:

```javascript
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

### 401 Unauthorized

Check that token is being sent in headers:

```javascript
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### Database Connection Failed

- Verify MySQL is running
- Check credentials in `backend/.env`
- Verify database `codearena` exists

### Token Expired

Tokens expire after 7 days by default. User needs to login again.

## 📚 Additional Resources

- Backend API Documentation: `backend/README.md`
- Database Schema: `database/mysql_schema.sql`
- ER Diagram: `database/ER_DIAGRAM.md`
- API Utility: `src/utils/api.js`

## 💡 Tips

1. **Use DevTools**: Check Network tab to see API requests/responses
2. **Error Handling**: All API functions throw errors, wrap in try-catch
3. **Loading States**: Show loading indicators while fetching data
4. **Token Storage**: Token stored in localStorage, persists across sessions
5. **Admin Features**: Check `isAdmin` from AuthContext, not currentUser.role directly

## 🎯 Quick Component Template

```javascript
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { contestAPI } from "../utils/api";

function MyComponent() {
  const { currentUser, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await contestAPI.getAll();
        setData(result.contests);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{/* Your component JSX */}</div>;
}

export default MyComponent;
```

---

**Good luck with the migration! The hard part is done - the backend is complete and working. Now it's just updating the frontend components to use the new API.** 🚀
