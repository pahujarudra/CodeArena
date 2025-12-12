const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/users/:userId - Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [users] = await db.query(
      `SELECT user_id, email, username, full_name, role, rating, total_solved, 
              total_submissions, bio, avatar_url, created_at 
       FROM users WHERE user_id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    
    // Get recent activities with problem and submission details
    const [activities] = await db.query(
      `SELECT 
        a.activity_id, 
        a.activity_type, 
        a.description, 
        a.activity_timestamp,
        a.problem_id,
        a.contest_id,
        a.submission_id,
        p.title as problem_title,
        p.difficulty,
        c.title as contest_title,
        s.status,
        s.score
       FROM user_activities a
       LEFT JOIN problems p ON a.problem_id = p.problem_id
       LEFT JOIN contests c ON a.contest_id = c.contest_id
       LEFT JOIN submissions s ON a.submission_id = s.submission_id
       WHERE a.user_id = ? 
       ORDER BY a.activity_timestamp DESC 
       LIMIT 10`,
      [userId]
    );

    res.json({
      userId: user.user_id,
      email: user.email,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      rating: user.rating,
      totalSolved: user.total_solved,
      totalSubmissions: user.total_submissions,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
      recentActivities: activities.map(a => ({
        activityId: a.activity_id,
        type: a.activity_type,
        description: a.description,
        timestamp: a.activity_timestamp,
        problemId: a.problem_id,
        problemTitle: a.problem_title,
        difficulty: a.difficulty,
        contestId: a.contest_id,
        contestTitle: a.contest_title,
        submissionId: a.submission_id,
        status: a.status,
        score: a.score
      }))
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// PUT /api/users/:userId - Update user profile
router.put('/:userId', authenticateToken, [
  body('fullName').optional().trim().isLength({ min: 1, max: 100 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('avatarUrl').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;

    // Check if user is authorized (can only update own profile unless admin)
    if (req.user.userId !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
    }

    const { fullName, bio, avatarUrl } = req.body;
    const updates = [];
    const values = [];

    if (fullName !== undefined) {
      updates.push('full_name = ?');
      values.push(fullName);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (avatarUrl !== undefined) {
      updates.push('avatar_url = ?');
      values.push(avatarUrl);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);

    await db.query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      values
    );

    // Get updated user
    const [users] = await db.query(
      `SELECT user_id, email, username, full_name, role, rating, total_solved, 
              total_submissions, bio, avatar_url, created_at, updated_at 
       FROM users WHERE user_id = ?`,
      [userId]
    );

    // Log activity
    await db.query(
      'INSERT INTO user_activities (user_id, activity_type, description) VALUES (?, ?, ?)',
      [userId, 'profile_updated', 'User updated their profile']
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        userId: users[0].user_id,
        email: users[0].email,
        username: users[0].username,
        fullName: users[0].full_name,
        role: users[0].role,
        rating: users[0].rating,
        totalSolved: users[0].total_solved,
        totalSubmissions: users[0].total_submissions,
        bio: users[0].bio,
        avatarUrl: users[0].avatar_url,
        createdAt: users[0].created_at,
        updatedAt: users[0].updated_at
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/users/:userId/submissions - Get user's submission history
router.get('/:userId/submissions', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const [submissions] = await db.query(
      `SELECT s.submission_id, s.problem_id, p.title as problem_title, 
              s.language, s.status, s.score, s.submitted_at,
              s.execution_time, s.memory_used
       FROM submissions s
       JOIN problems p ON s.problem_id = p.problem_id
       WHERE s.user_id = ?
       ORDER BY s.submitted_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM submissions WHERE user_id = ?',
      [userId]
    );

    res.json({
      submissions: submissions.map(s => ({
        submissionId: s.submission_id,
        problemId: s.problem_id,
        problemTitle: s.problem_title,
        language: s.language,
        status: s.status,
        score: s.score,
        submittedAt: s.submitted_at,
        executionTime: s.execution_time,
        memoryUsed: s.memory_used
      })),
      total: countResult[0].total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

// GET /api/users/:userId/stats - Get user statistics
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get basic stats from user table
    const [users] = await db.query(
      `SELECT rating, total_solved, total_submissions FROM users WHERE user_id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get problem difficulty breakdown
    const [difficultyStats] = await db.query(
      `SELECT p.difficulty, COUNT(DISTINCT s.problem_id) as solved_count
       FROM submissions s
       JOIN problems p ON s.problem_id = p.problem_id
       WHERE s.user_id = ? AND s.status = 'Accepted'
       GROUP BY p.difficulty`,
      [userId]
    );

    // Get language usage
    const [languageStats] = await db.query(
      `SELECT language, COUNT(*) as count
       FROM submissions
       WHERE user_id = ?
       GROUP BY language
       ORDER BY count DESC`,
      [userId]
    );

    // Get contest participation
    const [contestStats] = await db.query(
      `SELECT COUNT(*) as contests_participated, 
              SUM(CASE WHEN rank <= 3 THEN 1 ELSE 0 END) as top_3_finishes
       FROM contest_participants
       WHERE user_id = ?`,
      [userId]
    );

    res.json({
      rating: users[0].rating,
      totalSolved: users[0].total_solved,
      totalSubmissions: users[0].total_submissions,
      difficultyBreakdown: difficultyStats.reduce((acc, curr) => {
        acc[curr.difficulty.toLowerCase()] = curr.solved_count;
        return acc;
      }, { easy: 0, medium: 0, hard: 0 }),
      languageUsage: languageStats.map(l => ({
        language: l.language,
        count: l.count
      })),
      contestsParticipated: contestStats[0].contests_participated,
      top3Finishes: contestStats[0].top_3_finishes
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to get user statistics' });
  }
});

// GET /api/users - Get all users (leaderboard)
router.get('/', async (req, res) => {
  try {
    const { limit = 100, offset = 0, sortBy = 'rating' } = req.query;
    
    const validSortFields = ['rating', 'total_solved', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'rating';

    const [users] = await db.query(
      `SELECT user_id, username, full_name, rating, total_solved, 
              total_submissions, avatar_url, created_at
       FROM users
       WHERE role = 'user'
       ORDER BY ${sortField} DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM users WHERE role = "user"'
    );

    res.json({
      users: users.map(u => ({
        userId: u.user_id,
        username: u.username,
        fullName: u.full_name,
        rating: u.rating,
        totalSolved: u.total_solved,
        totalSubmissions: u.total_submissions,
        avatarUrl: u.avatar_url,
        createdAt: u.created_at
      })),
      total: countResult[0].total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

module.exports = router;
