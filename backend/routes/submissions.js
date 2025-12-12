const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// POST /api/submissions - Submit code for a problem
router.post('/', authenticateToken, [
  body('problemId').isInt(),
  body('code').isString().isLength({ min: 1 }),
  body('language').isIn(['javascript', 'python', 'cpp', 'java', 'c'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { problemId, code, language } = req.body;
    const userId = req.user.userId;

    // Check if problem exists
    const [problems] = await db.query(
      'SELECT problem_id, max_score, contest_id FROM problems WHERE problem_id = ?',
      [problemId]
    );

    if (problems.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const problem = problems[0];

    // Insert submission with pending status
    const [result] = await db.query(
      `INSERT INTO submissions (user_id, problem_id, code, language, status, score, 
                                execution_time, memory_used, submitted_at)
       VALUES (?, ?, ?, ?, 'Pending', 0, 0, 0, NOW())`,
      [userId, problemId, code, language]
    );

    const submissionId = result.insertId;

    // TODO: In production, you would send this to a code execution service (like Judge0)
    // For now, we'll simulate evaluation after a brief delay
    
    // Simulate code execution and evaluation
    setTimeout(async () => {
      try {
        // Get test cases
        const [testCases] = await db.query(
          'SELECT test_case_id, input, expected_output, points FROM test_cases WHERE problem_id = ?',
          [problemId]
        );

        // Simulate test case execution (in production, this would be done by Judge0 or similar)
        let totalScore = 0;
        let passedTests = 0;
        const status = Math.random() > 0.3 ? 'Accepted' : 'Wrong Answer'; // 70% acceptance rate simulation
        
        if (status === 'Accepted') {
          totalScore = problem.max_score;
          passedTests = testCases.length;
        } else {
          totalScore = Math.floor(problem.max_score * 0.6); // Partial credit
          passedTests = Math.floor(testCases.length * 0.6);
        }

        // Simulate execution metrics
        const executionTime = Math.floor(Math.random() * 1000) + 100; // 100-1100ms
        const memoryUsed = Math.floor(Math.random() * 50000) + 10000; // 10-60KB

        // Update submission with results (trigger will handle stats update)
        await db.query(
          `UPDATE submissions 
           SET status = ?, score = ?, execution_time = ?, memory_used = ?
           WHERE submission_id = ?`,
          [status, totalScore, executionTime, memoryUsed, submissionId]
        );

        // If it's a contest problem, update contest participant stats
        if (problem.contest_id) {
          await db.query(
            `UPDATE contest_participants 
             SET score = score + ?, problems_solved = problems_solved + ?
             WHERE contest_id = ? AND user_id = ?`,
            [totalScore, status === 'Accepted' ? 1 : 0, problem.contest_id, userId]
          );
        }

      } catch (error) {
        console.error('Submission evaluation error:', error);
        // Update submission with error status
        await db.query(
          `UPDATE submissions SET status = 'Runtime Error' WHERE submission_id = ?`,
          [submissionId]
        );
      }
    }, 2000); // 2 second delay to simulate execution

    res.status(201).json({
      message: 'Submission received and is being evaluated',
      submissionId: submissionId
    });

  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({ error: 'Failed to submit code' });
  }
});

// GET /api/submissions/:submissionId - Get submission details
router.get('/:submissionId', authenticateToken, async (req, res) => {
  try {
    const { submissionId } = req.params;

    const [submissions] = await db.query(
      `SELECT s.submission_id, s.user_id, s.problem_id, p.title as problem_title,
              s.code, s.language, s.status, s.score, s.execution_time, 
              s.memory_used, s.submitted_at, u.username
       FROM submissions s
       JOIN problems p ON s.problem_id = p.problem_id
       JOIN users u ON s.user_id = u.user_id
       WHERE s.submission_id = ?`,
      [submissionId]
    );

    if (submissions.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const submission = submissions[0];

    // Check authorization (users can only see their own submissions unless admin)
    if (submission.user_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this submission' });
    }

    res.json({
      submissionId: submission.submission_id,
      userId: submission.user_id,
      username: submission.username,
      problemId: submission.problem_id,
      problemTitle: submission.problem_title,
      code: submission.code,
      language: submission.language,
      status: submission.status,
      score: submission.score,
      executionTime: submission.execution_time,
      memoryUsed: submission.memory_used,
      submittedAt: submission.submitted_at
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ error: 'Failed to get submission' });
  }
});

// GET /api/submissions - Get submissions (with filters)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      userId, 
      problemId, 
      status, 
      limit = 50, 
      offset = 0 
    } = req.query;

    let query = `
      SELECT s.submission_id, s.user_id, u.username, s.problem_id, 
             p.title as problem_title, s.language, s.status, s.score,
             s.execution_time, s.memory_used, s.submitted_at
      FROM submissions s
      JOIN problems p ON s.problem_id = p.problem_id
      JOIN users u ON s.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];

    // Non-admin users can only see their own submissions
    if (req.user.role !== 'admin') {
      query += ' AND s.user_id = ?';
      params.push(req.user.userId);
    } else if (userId) {
      query += ' AND s.user_id = ?';
      params.push(userId);
    }

    if (problemId) {
      query += ' AND s.problem_id = ?';
      params.push(problemId);
    }

    if (status) {
      query += ' AND s.status = ?';
      params.push(status);
    }

    query += ' ORDER BY s.submitted_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [submissions] = await db.query(query, params);

    res.json({
      submissions: submissions.map(s => ({
        submissionId: s.submission_id,
        userId: s.user_id,
        username: s.username,
        problemId: s.problem_id,
        problemTitle: s.problem_title,
        language: s.language,
        status: s.status,
        score: s.score,
        executionTime: s.execution_time,
        memoryUsed: s.memory_used,
        submittedAt: s.submitted_at
      }))
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

// GET /api/submissions/:submissionId/status - Check submission status (polling endpoint)
router.get('/:submissionId/status', authenticateToken, async (req, res) => {
  try {
    const { submissionId } = req.params;

    const [submissions] = await db.query(
      `SELECT submission_id, user_id, status, score, execution_time, memory_used
       FROM submissions
       WHERE submission_id = ?`,
      [submissionId]
    );

    if (submissions.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const submission = submissions[0];

    // Check authorization
    if (submission.user_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this submission' });
    }

    res.json({
      submissionId: submission.submission_id,
      status: submission.status,
      score: submission.score,
      executionTime: submission.execution_time,
      memoryUsed: submission.memory_used
    });
  } catch (error) {
    console.error('Get submission status error:', error);
    res.status(500).json({ error: 'Failed to get submission status' });
  }
});

module.exports = router;
