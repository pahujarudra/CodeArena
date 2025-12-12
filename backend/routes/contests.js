const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/contests - Get all contests
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT contest_id, title, description, start_time, end_time, 
             duration_minutes, max_participants, created_by, created_at
      FROM contests
    `;
    const params = [];

    if (status === 'upcoming') {
      query += ' WHERE start_time > NOW()';
    } else if (status === 'ongoing') {
      query += ' WHERE start_time <= NOW() AND end_time >= NOW()';
    } else if (status === 'completed') {
      query += ' WHERE end_time < NOW()';
    }

    query += ' ORDER BY start_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [contests] = await db.query(query, params);

    // Get participant counts for each contest
    const contestIds = contests.map(c => c.contest_id);
    let participantCounts = {};
    
    if (contestIds.length > 0) {
      const [counts] = await db.query(
        `SELECT contest_id, COUNT(*) as participant_count
         FROM contest_participants
         WHERE contest_id IN (?)
         GROUP BY contest_id`,
        [contestIds]
      );
      participantCounts = counts.reduce((acc, curr) => {
        acc[curr.contest_id] = curr.participant_count;
        return acc;
      }, {});
    }

    res.json({
      contests: contests.map(c => ({
        contestId: c.contest_id,
        title: c.title,
        description: c.description,
        startTime: c.start_time,
        endTime: c.end_time,
        durationMinutes: c.duration_minutes,
        maxParticipants: c.max_participants,
        currentParticipants: participantCounts[c.contest_id] || 0,
        createdBy: c.created_by,
        createdAt: c.created_at
      })),
      total: contests.length
    });
  } catch (error) {
    console.error('Get contests error:', error);
    res.status(500).json({ error: 'Failed to get contests' });
  }
});

// GET /api/contests/:contestId - Get contest details
router.get('/:contestId', async (req, res) => {
  try {
    const { contestId } = req.params;

    const [contests] = await db.query(
      `SELECT contest_id, title, description, start_time, end_time, 
              duration_minutes, max_participants, created_by, created_at
       FROM contests WHERE contest_id = ?`,
      [contestId]
    );

    if (contests.length === 0) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    const contest = contests[0];

    // Get problems in this contest
    const [problems] = await db.query(
      `SELECT problem_id, title, difficulty, max_score, total_submissions, acceptance_rate
       FROM problems
       WHERE contest_id = ?
       ORDER BY problem_id`,
      [contestId]
    );

    // Get participant count
    const [participantCount] = await db.query(
      'SELECT COUNT(*) as count FROM contest_participants WHERE contest_id = ?',
      [contestId]
    );

    res.json({
      contestId: contest.contest_id,
      title: contest.title,
      description: contest.description,
      startTime: contest.start_time,
      endTime: contest.end_time,
      durationMinutes: contest.duration_minutes,
      maxParticipants: contest.max_participants,
      currentParticipants: participantCount[0].count,
      createdBy: contest.created_by,
      createdAt: contest.created_at,
      problems: problems.map(p => ({
        problemId: p.problem_id,
        title: p.title,
        difficulty: p.difficulty,
        maxScore: p.max_score,
        totalSubmissions: p.total_submissions,
        acceptanceRate: p.acceptance_rate
      }))
    });
  } catch (error) {
    console.error('Get contest details error:', error);
    res.status(500).json({ error: 'Failed to get contest details' });
  }
});

// POST /api/contests - Create new contest (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('description').trim().isLength({ min: 10 }),
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('endTime').notEmpty().withMessage('End time is required'),
  body('durationMinutes').isInt({ min: 30, max: 600 }),
  body('maxParticipants').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    console.log('Received contest data:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, startTime, endTime, durationMinutes, maxParticipants } = req.body;

    // Validate times
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const [result] = await db.query(
      `INSERT INTO contests (title, description, start_time, end_time, duration_minutes, max_participants, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, startTime, endTime, durationMinutes, maxParticipants || null, req.user.userId]
    );

    res.status(201).json({
      message: 'Contest created successfully',
      contestId: result.insertId
    });
  } catch (error) {
    console.error('Create contest error:', error);
    res.status(500).json({ error: 'Failed to create contest' });
  }
});

// POST /api/contests/:contestId/join - Join a contest
router.post('/:contestId/join', authenticateToken, async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user.userId;

    // Check if contest exists and is not full
    const [contests] = await db.query(
      `SELECT contest_id, max_participants, start_time, end_time FROM contests WHERE contest_id = ?`,
      [contestId]
    );

    if (contests.length === 0) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    const contest = contests[0];

    // Check if already joined
    const [existing] = await db.query(
      'SELECT * FROM contest_participants WHERE contest_id = ? AND user_id = ?',
      [contestId, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Already joined this contest' });
    }

    // Check participant limit
    if (contest.max_participants) {
      const [count] = await db.query(
        'SELECT COUNT(*) as count FROM contest_participants WHERE contest_id = ?',
        [contestId]
      );
      
      if (count[0].count >= contest.max_participants) {
        return res.status(400).json({ error: 'Contest is full' });
      }
    }

    // Join contest
    await db.query(
      'INSERT INTO contest_participants (contest_id, user_id, score, rank) VALUES (?, ?, 0, 0)',
      [contestId, userId]
    );

    // Log activity
    await db.query(
      'INSERT INTO user_activities (user_id, activity_type, description, contest_id) VALUES (?, ?, ?, ?)',
      [userId, 'contest_joined', `Joined contest`, contestId]
    );

    res.json({ message: 'Successfully joined contest' });
  } catch (error) {
    console.error('Join contest error:', error);
    res.status(500).json({ error: 'Failed to join contest' });
  }
});

// GET /api/contests/:contestId/leaderboard - Get contest leaderboard
router.get('/:contestId/leaderboard', async (req, res) => {
  try {
    const { contestId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const [leaderboard] = await db.query(
      `SELECT cp.user_id, u.username, u.full_name, u.avatar_url,
              cp.score, cp.rank, cp.problems_solved, cp.joined_at
       FROM contest_participants cp
       JOIN users u ON cp.user_id = u.user_id
       WHERE cp.contest_id = ?
       ORDER BY cp.score DESC, cp.problems_solved DESC, cp.joined_at ASC
       LIMIT ? OFFSET ?`,
      [contestId, parseInt(limit), parseInt(offset)]
    );

    // Update ranks (this could be done with a trigger, but doing it here for simplicity)
    for (let i = 0; i < leaderboard.length; i++) {
      const newRank = parseInt(offset) + i + 1;
      if (leaderboard[i].rank !== newRank) {
        await db.query(
          'UPDATE contest_participants SET rank = ? WHERE contest_id = ? AND user_id = ?',
          [newRank, contestId, leaderboard[i].user_id]
        );
        leaderboard[i].rank = newRank;
      }
    }

    res.json({
      leaderboard: leaderboard.map(l => ({
        userId: l.user_id,
        username: l.username,
        fullName: l.full_name,
        avatarUrl: l.avatar_url,
        score: l.score,
        rank: l.rank,
        problemsSolved: l.problems_solved,
        joinedAt: l.joined_at
      }))
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// DELETE /api/contests/:contestId - Delete contest (admin only)
router.delete('/:contestId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { contestId } = req.params;

    const [result] = await db.query('DELETE FROM contests WHERE contest_id = ?', [contestId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contest not found' });
    }

    res.json({ message: 'Contest deleted successfully' });
  } catch (error) {
    console.error('Delete contest error:', error);
    res.status(500).json({ error: 'Failed to delete contest' });
  }
});

module.exports = router;
