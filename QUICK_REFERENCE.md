# 🚀 Quick Reference - Firebase to MySQL

## 🎯 What You Have Now

### Backend (✅ 100% Complete)

```
✅ Express.js REST API on port 5001
✅ JWT authentication system
✅ 30+ API endpoints
✅ MySQL database schema installed
✅ Complete API documentation
```

### Frontend (✅ 60% Complete)

```
✅ AuthContext (JWT-based)
✅ Login/Signup modals
✅ API utility functions
✅ Navbar with logout
⚠️ 6 pages need updates (3-4 hours work)
```

## ⚡ Quick Start (5 minutes)

```bash
# 1. Set MySQL password
# Edit: backend/.env
DB_PASSWORD=your_password

# 2. Install database
mysql -u root -p < database/mysql_schema.sql

# 3. Start backend (Terminal 1)
cd backend && npm run dev

# 4. Start frontend (Terminal 2)
npm run dev

# 5. Open browser
http://localhost:5173
```

## 🔑 Auth Changes Quick Reference

### Old (Firebase)

```javascript
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

await signInWithEmailAndPassword(auth, email, password);
```

### New (MySQL)

```javascript
import { useAuth } from "./context/AuthContext";

const { login } = useAuth();
await login(email, password);
```

## 📦 API Usage Examples

### Contests

```javascript
import { contestAPI } from "./utils/api";

// Get all contests
const data = await contestAPI.getAll("ongoing");
setContests(data.contests);

// Get contest details
const contest = await contestAPI.getById(contestId);

// Join contest
await contestAPI.join(contestId);
```

### Problems

```javascript
import { problemAPI } from "./utils/api";

// Get problem
const problem = await problemAPI.getById(problemId);

// Create problem (admin)
await problemAPI.create({
  title,
  description,
  difficulty,
  maxScore,
  timeLimit,
  memoryLimit,
});
```

### Submissions

```javascript
import { submissionAPI } from "./utils/api";

// Submit code
const result = await submissionAPI.submit({
  problemId,
  code,
  language,
});

// Check status
const status = await submissionAPI.getStatus(result.submissionId);
```

### Users

```javascript
import { userAPI } from "./utils/api";

// Get profile
const user = await userAPI.getById(userId);

// Update profile
await userAPI.update(userId, { fullName, bio, avatarUrl });

// Get stats
const stats = await userAPI.getStats(userId);
```

## 🔄 Field Name Mapping

| Firebase   | MySQL Backend                      |
| ---------- | ---------------------------------- |
| `uid`      | `userId`                           |
| `fullname` | `fullName`                         |
| `photoURL` | `avatarUrl`                        |
| `isAdmin`  | `role === 'admin'`                 |
| `id`       | `problemId/contestId/submissionId` |

## 📄 Pages That Need Updates

```
src/pages/Profile.jsx         (~30 min)
src/pages/Contests.jsx         (~20 min)
src/pages/ContestDetails.jsx   (~30 min)
src/pages/Admin.jsx            (~45 min)
src/pages/ProblemSolver.jsx    (~30 min)
src/pages/Home.jsx             (~15 min)
```

## 🛠️ Update Pattern

### Step 1: Remove Firebase imports

```javascript
// Remove these
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
```

### Step 2: Add API imports

```javascript
// Add these
import { contestAPI, problemAPI, userAPI } from "../utils/api";
```

### Step 3: Replace queries

```javascript
// Old
const q = query(collection(db, "contests"));
const snapshot = await getDocs(q);
const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

// New
const data = await contestAPI.getAll();
```

### Step 4: Update field names

```javascript
// Old
<h1>{user.fullname}</h1>

// New
<h1>{user.fullName}</h1>
```

## 📚 Documentation Files

| File                            | Purpose                     |
| ------------------------------- | --------------------------- |
| `SETUP_GUIDE.md`                | Complete setup instructions |
| `MIGRATION_GUIDE_FRONTEND.md`   | How to update pages         |
| `MIGRATION_COMPLETE_SUMMARY.md` | Full project status         |
| `backend/README.md`             | API documentation           |

## 🐛 Common Issues

### Backend won't start

```bash
# Check MySQL password in backend/.env
# Make sure port 5001 is free
lsof -ti:5001 | xargs kill -9
```

### Database connection failed

```bash
# Verify MySQL is running
mysql --version

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### CORS errors

```bash
# Backend must be on port 5001
# Frontend must be on port 5173
# Already configured, just verify ports
```

## ✅ Testing Checklist

```
□ Start backend server (port 5001)
□ Start frontend server (port 5173)
□ Sign up new user
□ Login with new user
□ Check user appears in navbar
□ Update profile (when page migrated)
□ Logout
□ Login again
```

## 🎯 What's Already Working

- ✅ User signup (stores in MySQL)
- ✅ User login (returns JWT)
- ✅ User logout (clears token)
- ✅ Auth persistence (localStorage)
- ✅ Protected API routes
- ✅ Admin role checking

## 🎨 API Response Format

All APIs return consistent format:

```javascript
// Success
{
  data: {...},
  message: "Success"
}

// Error
{
  error: "Error message"
}
```

## 🔐 Authentication

All protected routes need token in header:

```javascript
headers: {
  "Authorization": `Bearer ${localStorage.getItem("token")}`
}
```

This is automatically handled by `src/utils/api.js`!

## 💾 Database Access

```bash
# Connect to database
mysql -u root -p codearena

# View tables
SHOW TABLES;

# Check users
SELECT * FROM users;

# Check activities
SELECT * FROM user_activities ORDER BY activity_timestamp DESC LIMIT 10;
```

## 🚀 Production Deployment

When ready for production:

1. Set strong JWT_SECRET
2. Change NODE_ENV to 'production'
3. Use environment-specific DB credentials
4. Enable HTTPS
5. Set up proper CORS origins

## 📞 Get Help

1. Read `SETUP_GUIDE.md` for setup issues
2. Check `MIGRATION_GUIDE_FRONTEND.md` for page updates
3. See `backend/README.md` for API details
4. Review `database/` folder for DB info

---

**You're 80% done! Just update the 6 frontend pages and you're ready to go!** 🎉

**Next step:** Follow `SETUP_GUIDE.md` to test authentication, then use `MIGRATION_GUIDE_FRONTEND.md` to update the remaining pages.
