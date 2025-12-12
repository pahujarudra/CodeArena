const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/problems - Get all problems
router.get('/', async (req, res) => {
  try {
    const { difficulty, contestId, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT problem_id, title, difficulty, max_score, time_limit, memory_limit,
             contest_id, total_submissions, acceptance_rate, created_at
      FROM problems
      WHERE 1=1
    `;
    const params = [];

    if (difficulty) {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }

    if (contestId) {
      query += ' AND contest_id = ?';
      params.push(contestId);
    }

    query += ' ORDER BY problem_id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [problems] = await db.query(query, params);

    res.json({
      problems: problems.map(p => ({
        problemId: p.problem_id,
        title: p.title,
        difficulty: p.difficulty,
        maxScore: p.max_score,
        timeLimit: p.time_limit,
        memoryLimit: p.memory_limit,
        contestId: p.contest_id,
        totalSubmissions: p.total_submissions,
        acceptanceRate: p.acceptance_rate,
        createdAt: p.created_at
      }))
    });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ error: 'Failed to get problems' });
  }
});

// GET /api/problems/:problemId - Get problem details
router.get('/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;

    const [problems] = await db.query(
      `SELECT problem_id, title, description, difficulty, max_score, 
              time_limit, memory_limit, contest_id, total_submissions, 
              acceptance_rate, created_by, created_at
       FROM problems WHERE problem_id = ?`,
      [problemId]
    );

    if (problems.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const problem = problems[0];

    // Get test cases (only sample test cases for users, all for admins)
    const [testCases] = await db.query(
      `SELECT test_case_id, input, expected_output, is_sample, points
       FROM test_cases
       WHERE problem_id = ?
       ORDER BY test_case_id`,
      [problemId]
    );

    res.json({
      problemId: problem.problem_id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      maxScore: problem.max_score,
      timeLimit: problem.time_limit,
      memoryLimit: problem.memory_limit,
      contestId: problem.contest_id,
      totalSubmissions: problem.total_submissions,
      acceptanceRate: problem.acceptance_rate,
      createdBy: problem.created_by,
      createdAt: problem.created_at,
      sampleTestCases: testCases
        .filter(tc => tc.is_sample)
        .map(tc => ({
          testCaseId: tc.test_case_id,
          input: tc.input,
          expectedOutput: tc.expected_output,
          points: tc.points
        })),
      totalTestCases: testCases.length
    });
  } catch (error) {
    console.error('Get problem details error:', error);
    res.status(500).json({ error: 'Failed to get problem details' });
  }
});

// POST /api/problems - Create new problem (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('description').trim().isLength({ min: 10 }),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']),
  body('maxScore').isInt({ min: 1, max: 1000 }),
  body('timeLimit').isInt({ min: 100, max: 60000 }),
  body('memoryLimit').isInt({ min: 1, max: 1024 }),
  body('contestId').optional().isInt()
], async (req, res) => {
  try {
    console.log('Received problem data:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      title, description, difficulty, maxScore, 
      timeLimit, memoryLimit, contestId, testCases 
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO problems (title, description, difficulty, max_score, time_limit, 
                            memory_limit, contest_id, created_by, total_submissions, acceptance_rate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0.0)`,
      [title, description, difficulty, maxScore, timeLimit, memoryLimit, 
       contestId || null, req.user.userId]
    );

    const problemId = result.insertId;

    // Insert test cases if provided
    if (testCases && Array.isArray(testCases) && testCases.length > 0) {
      const testCaseValues = testCases.map(tc => [
        problemId,
        tc.input,
        tc.expectedOutput,
        tc.isSample || 0,
        tc.points || 10
      ]);

      await db.query(
        `INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points)
         VALUES ?`,
        [testCaseValues]
      );
    }

    res.status(201).json({
      message: 'Problem created successfully',
      problemId: problemId
    });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({ error: 'Failed to create problem' });
  }
});

// PUT /api/problems/:problemId - Update problem (admin only)
router.put('/:problemId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { problemId } = req.params;
    const { title, description, difficulty, maxScore, timeLimit, memoryLimit } = req.body;

    const updates = [];
    const values = [];

    if (title) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description) {
      updates.push('description = ?');
      values.push(description);
    }
    if (difficulty) {
      updates.push('difficulty = ?');
      values.push(difficulty);
    }
    if (maxScore) {
      updates.push('max_score = ?');
      values.push(maxScore);
    }
    if (timeLimit) {
      updates.push('time_limit = ?');
      values.push(timeLimit);
    }
    if (memoryLimit) {
      updates.push('memory_limit = ?');
      values.push(memoryLimit);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(problemId);

    await db.query(
      `UPDATE problems SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE problem_id = ?`,
      values
    );

    res.json({ message: 'Problem updated successfully' });
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({ error: 'Failed to update problem' });
  }
});

// DELETE /api/problems/:problemId - Delete problem (admin only)
router.delete('/:problemId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { problemId } = req.params;

    const [result] = await db.query('DELETE FROM problems WHERE problem_id = ?', [problemId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({ error: 'Failed to delete problem' });
  }
});

// POST /api/problems/:problemId/test-cases - Add test case (admin only)
router.post('/:problemId/test-cases', authenticateToken, requireAdmin, [
  body('input').isString(),
  body('expectedOutput').isString(),
  body('isSample').isBoolean(),
  body('points').isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { problemId } = req.params;
    const { input, expectedOutput, isSample, points } = req.body;

    // Check if problem exists
    const [problems] = await db.query('SELECT problem_id FROM problems WHERE problem_id = ?', [problemId]);
    if (problems.length === 0) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const [result] = await db.query(
      `INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points)
       VALUES (?, ?, ?, ?, ?)`,
      [problemId, input, expectedOutput, isSample, points]
    );

    res.status(201).json({
      message: 'Test case added successfully',
      testCaseId: result.insertId
    });
  } catch (error) {
    console.error('Add test case error:', error);
    res.status(500).json({ error: 'Failed to add test case' });
  }
});

// GET /api/problems/:problemId/test-cases - Get all test cases (admin only)
router.get('/:problemId/test-cases', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { problemId } = req.params;

    const [testCases] = await db.query(
      `SELECT test_case_id, input, expected_output, is_sample, points, created_at
       FROM test_cases
       WHERE problem_id = ?
       ORDER BY test_case_id`,
      [problemId]
    );

    res.json({
      testCases: testCases.map(tc => ({
        testCaseId: tc.test_case_id,
        input: tc.input,
        expectedOutput: tc.expected_output,
        isSample: tc.is_sample,
        points: tc.points,
        createdAt: tc.created_at
      }))
    });
  } catch (error) {
    console.error('Get test cases error:', error);
    res.status(500).json({ error: 'Failed to get test cases' });
  }
});

// DELETE /api/problems/:problemId/test-cases/:testCaseId - Delete test case (admin only)
router.delete('/:problemId/test-cases/:testCaseId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { problemId, testCaseId } = req.params;

    const [result] = await db.query(
      'DELETE FROM test_cases WHERE test_case_id = ? AND problem_id = ?',
      [testCaseId, problemId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Test case not found' });
    }

    res.json({ message: 'Test case deleted successfully' });
  } catch (error) {
    console.error('Delete test case error:', error);
    res.status(500).json({ error: 'Failed to delete test case' });
  }
});

module.exports = router;
