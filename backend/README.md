# CodeArena Backend API

Express.js REST API server for CodeArena competitive programming platform with MySQL database.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**

```bash
cd backend
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=codearena
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

3. **Set up MySQL database:**

```bash
# Make sure MySQL is running
# Then execute the schema file
mysql -u root -p < ../database/mysql_schema.sql
```

4. **Start the server:**

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/signup

Register a new user.

```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "john_doe",
  "fullName": "John Doe"
}
```

#### POST /api/auth/login

Login existing user.

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Returns JWT token in response.

#### GET /api/auth/me

Get current user profile (requires authentication).
Headers: `Authorization: Bearer <token>`

#### POST /api/auth/logout

Logout user (requires authentication).

### User Endpoints

#### GET /api/users/:userId

Get user profile by ID.

#### PUT /api/users/:userId

Update user profile (requires authentication).

```json
{
  "fullName": "John Smith",
  "bio": "Competitive programmer",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

#### GET /api/users/:userId/submissions

Get user's submission history.

#### GET /api/users/:userId/stats

Get user statistics (rating, problems solved, etc.).

#### GET /api/users

Get all users (leaderboard).

### Contest Endpoints

#### GET /api/contests

Get all contests. Query params: `status` (upcoming/ongoing/completed)

#### GET /api/contests/:contestId

Get contest details with problems.

#### POST /api/contests

Create new contest (admin only, requires authentication).

```json
{
  "title": "Weekly Contest 1",
  "description": "Contest description",
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T12:00:00Z",
  "durationMinutes": 120,
  "maxParticipants": 100
}
```

#### POST /api/contests/:contestId/join

Join a contest (requires authentication).

#### GET /api/contests/:contestId/leaderboard

Get contest leaderboard.

#### DELETE /api/contests/:contestId

Delete contest (admin only).

### Problem Endpoints

#### GET /api/problems

Get all problems. Query params: `difficulty`, `contestId`

#### GET /api/problems/:problemId

Get problem details with sample test cases.

#### POST /api/problems

Create new problem (admin only, requires authentication).

```json
{
  "title": "Two Sum",
  "description": "Problem description...",
  "difficulty": "Easy",
  "maxScore": 100,
  "timeLimit": 1,
  "memoryLimit": 256,
  "contestId": 1
}
```

#### PUT /api/problems/:problemId

Update problem (admin only).

#### DELETE /api/problems/:problemId

Delete problem (admin only).

#### POST /api/problems/:problemId/test-cases

Add test case to problem (admin only).

```json
{
  "input": "1 2\n3 4",
  "expectedOutput": "4 6",
  "isSample": true,
  "points": 10
}
```

#### GET /api/problems/:problemId/test-cases

Get all test cases (admin only).

#### DELETE /api/problems/:problemId/test-cases/:testCaseId

Delete test case (admin only).

### Submission Endpoints

#### POST /api/submissions

Submit code for a problem (requires authentication).

```json
{
  "problemId": 1,
  "code": "console.log('Hello World');",
  "language": "javascript"
}
```

Supported languages: `javascript`, `python`, `cpp`, `java`, `c`

#### GET /api/submissions/:submissionId

Get submission details (requires authentication).

#### GET /api/submissions

Get submissions with filters (requires authentication).
Query params: `userId`, `problemId`, `status`

#### GET /api/submissions/:submissionId/status

Check submission status (polling endpoint).

## 🔐 Authentication

This API uses JWT (JSON Web Tokens) for authentication.

1. Login or signup to receive a token
2. Include the token in the Authorization header for protected routes:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

## 🛠️ Tech Stack

- **Express.js** - Web framework
- **MySQL2** - MySQL client
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-validator** - Request validation
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js       # MySQL connection pool
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── users.js          # User management routes
│   ├── contests.js       # Contest routes
│   ├── problems.js       # Problem routes
│   └── submissions.js    # Submission routes
├── .env.example          # Environment variables template
├── package.json          # Dependencies
└── server.js             # Main server file
```

## 🧪 Testing

Test the API health:

```bash
curl http://localhost:5000/api/health
```

## 🐛 Troubleshooting

### Database connection failed

- Make sure MySQL is running
- Check credentials in `.env` file
- Verify database `codearena` exists

### Port already in use

- Change PORT in `.env` file
- Or kill process using port 5000: `lsof -ti:5000 | xargs kill`

## 📝 Notes

- The submission evaluation is currently simulated. In production, integrate with a code execution service like Judge0 API.
- Admin users have additional privileges (create/edit/delete contests and problems).
- The first user registered can be manually set as admin in the database.

## 🔄 Migration from Firebase

This backend completely replaces Firebase:

- **Firebase Auth** → JWT-based authentication
- **Firestore** → MySQL relational database
- All data is now stored in MySQL with proper relationships and constraints

## 📄 License

MIT
