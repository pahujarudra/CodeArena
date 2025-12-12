const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Validation rules
const signupValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('username').trim().isLength({ min: 3, max: 50 }),
  body('fullName').trim().isLength({ min: 1, max: 100 })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.user_id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/signup - Register new user
router.post('/signup', signupValidation, async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, username, fullName } = req.body;

    // Check if user already exists
    const [existingUsers] = await db.query(
      'SELECT user_id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.query(
      `INSERT INTO users (email, username, full_name, password_hash, role, rating, total_solved, total_submissions) 
       VALUES (?, ?, ?, ?, 'user', 1200, 0, 0)`,
      [email, username, fullName, hashedPassword]
    );

    // Get the created user
    const [newUser] = await db.query(
      'SELECT user_id, email, username, full_name, role, rating, created_at FROM users WHERE user_id = ?',
      [result.insertId]
    );

    // Generate token
    const token = generateToken(newUser[0]);

    // Log activity
    await db.query(
      'INSERT INTO user_activities (user_id, activity_type, description) VALUES (?, ?, ?)',
      [result.insertId, 'account_created', `User ${username} signed up`]
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        userId: newUser[0].user_id,
        email: newUser[0].email,
        username: newUser[0].username,
        fullName: newUser[0].full_name,
        role: newUser[0].role,
        rating: newUser[0].rating,
        createdAt: newUser[0].created_at
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// POST /api/auth/login - Login user
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user);

    // Update last login
    await db.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [user.user_id]
    );

    // Log activity
    await db.query(
      'INSERT INTO user_activities (user_id, activity_type, description) VALUES (?, ?, ?)',
      [user.user_id, 'login', `User ${user.username} logged in`]
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
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
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT user_id, email, username, full_name, role, rating, total_solved, total_submissions, bio, avatar_url, created_at FROM users WHERE user_id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
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
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

// POST /api/auth/logout - Logout user (client-side token removal)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Log activity
    await db.query(
      'INSERT INTO user_activities (user_id, activity_type, description) VALUES (?, ?, ?)',
      [req.user.userId, 'logout', 'User logged out']
    );

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

module.exports = router;
