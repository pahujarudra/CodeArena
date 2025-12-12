# 🚀 Complete Setup Guide - CodeArena MySQL Migration

## Prerequisites

- ✅ Node.js (v16+)
- ✅ MySQL (v8.0+)
- ✅ npm or yarn

## Step-by-Step Setup

### 1. Configure MySQL Password

Edit `backend/.env` and set your MySQL password:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here  # ⚠️ SET THIS!
DB_NAME=codearena
```

If you don't have a MySQL password, you can set one:

```bash
# macOS
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
FLUSH PRIVILEGES;
exit;
```

### 2. Install MySQL Database Schema

```bash
# Make sure MySQL is running
mysql -u root -p < database/mysql_schema.sql
```

This will create:

- Database: `codearena`
- 7 tables (users, contests, problems, test_cases, submissions, etc.)
- 4 views (leaderboards, stats)
- 3 triggers (auto-update stats)
- 3 stored procedures

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Start Backend Server

```bash
# Development mode (with auto-reload)
cd backend
npm run dev

# OR Production mode
npm start
```

Server will start at: `http://localhost:5001`

You should see:

```
🚀 Server is running on port 5001
📊 Environment: development
✅ MySQL Database connected successfully
```

### 5. Start Frontend

Open a **new terminal** and run:

```bash
# From project root
npm run dev
```

Frontend will start at: `http://localhost:5173`

## ✅ Testing the Setup

### Test 1: Backend Health Check

```bash
curl http://localhost:5001/api/health
```

Expected response:

```json
{ "status": "OK", "message": "Server is running" }
```

### Test 2: Signup New User

Open `http://localhost:5173` in your browser:

1. Click "Sign Up"
2. Fill in the form:
   - Full Name: John Doe
   - Username: johndoe
   - Email: john@example.com
   - Password: password123
3. Click "Create Account"

If successful:

- You'll be logged in automatically
- Your name will appear in the navbar
- Profile and Admin links will appear

### Test 3: Login

1. Click "Logout"
2. Click "Login"
3. Enter credentials:
   - Email: john@example.com
   - Password: password123
4. Click "Login"

### Test 4: Check Database

```bash
mysql -u root -p codearena

# View users
SELECT * FROM users;

# View user activities
SELECT * FROM user_activities ORDER BY activity_timestamp DESC LIMIT 5;
```

You should see your new user and activities (signup, login, logout).

## 🔧 Current Status

### ✅ Fully Functional

- Backend API (100% complete)
  - Authentication (signup, login, logout)
  - User management
  - Contests CRUD
  - Problems CRUD
  - Submissions handling
- Frontend Auth System
  - AuthContext (JWT-based)
  - Login Modal
  - Signup Modal
  - Navbar with logout

### ⚠️ Needs Migration (Still uses Firebase)

- Profile Page
- Contests Page
- Contest Details Page
- Admin Page
- Problem Solver Page
- Home Page

See `MIGRATION_GUIDE_FRONTEND.md` for detailed instructions on updating these components.

## 📁 Important Files

### Backend

- `backend/server.js` - Main server file
- `backend/config/database.js` - MySQL connection
- `backend/routes/*.js` - API endpoints
- `backend/.env` - Configuration (set your MySQL password here!)
- `backend/README.md` - API documentation

### Frontend

- `src/context/AuthContext.jsx` - Auth logic (✅ updated)
- `src/utils/api.js` - API calls (✅ new)
- `src/components/modals/LoginModal.jsx` - (✅ updated)
- `src/components/modals/SignupModal.jsx` - (✅ updated)
- `src/components/Navbar.jsx` - (✅ updated)
- `.env` - Frontend config

### Database

- `database/mysql_schema.sql` - Complete schema
- `database/ER_DIAGRAM.md` - Database design
- `database/README.md` - Database docs

## 🐛 Troubleshooting

### Problem: MySQL connection failed

**Solution:**

1. Check MySQL is running: `mysql --version`
2. Set password in `backend/.env`
3. Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Problem: Port 5001 already in use

**Solution:**

```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or change port in backend/.env
```

### Problem: CORS errors

**Solution:** Make sure backend is running on port 5001 and frontend on port 5173. CORS is already configured in `backend/server.js`.

### Problem: "Token required" errors

**Solution:** Make sure you're logged in. Token is stored in localStorage and sent with each request.

### Problem: Frontend pages still broken

**Solution:** Those pages still use Firebase. Follow `MIGRATION_GUIDE_FRONTEND.md` to update them.

## 🎯 What Works Right Now

### ✅ Working Features

1. **Signup** - Creates user in MySQL
2. **Login** - Returns JWT token
3. **Logout** - Clears token
4. **Authentication State** - Persists across page reloads
5. **Protected Routes** - Backend validates JWT tokens
6. **User Profile Updates** - Via AuthContext.updateProfile()

### ⏳ Partially Working

- **Contests, Problems, Submissions** - Backend APIs ready, but frontend pages need updates

### ❌ Not Working Yet

- Any page that still imports from `src/firebase.js`
- Firestore queries need to be replaced with API calls

## 🚀 Quick Start Commands

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend (new terminal)
npm run dev

# Terminal 3: MySQL (optional, for testing)
mysql -u root -p codearena
```

## 📊 Database Statistics

After setup, you'll have:

- **7 Tables**: users, contests, problems, test_cases, submissions, contest_participants, user_activities
- **20+ Indexes**: For fast queries
- **4 Views**: Leaderboards, problem stats, submission history
- **3 Triggers**: Auto-update stats on insert/delete
- **3 Stored Procedures**: User stats, problem stats, activities

## 🔐 First Admin User

The first user to signup is a regular user. To make them admin:

```bash
mysql -u root -p codearena

UPDATE users SET role = 'admin' WHERE user_id = 1;

# Verify
SELECT user_id, username, role FROM users;
```

Then logout and login again to get admin access.

## 📝 Next Steps

1. **Set MySQL password** in `backend/.env`
2. **Install database** schema
3. **Start backend** server
4. **Test authentication** (signup, login)
5. **Update remaining pages** (see MIGRATION_GUIDE_FRONTEND.md)

## 💡 Pro Tips

- Keep both terminals open (backend + frontend)
- Use browser DevTools Network tab to debug API calls
- Check `backend/README.md` for complete API documentation
- Use `MIGRATION_GUIDE_FRONTEND.md` as reference while updating components
- Test each feature after migrating a component

---

**You're ready to go! Start with setting your MySQL password, then follow the steps above.** 🎉
