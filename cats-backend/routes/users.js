const express = require('express');
const { authenticateToken, adminOnly } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.toSafeJSON()
    }
  });
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'User profile update endpoint - to be implemented'
  });
});

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get('/', authenticateToken, adminOnly, (req, res) => {
  res.json({
    success: true,
    message: 'Users list endpoint - to be implemented'
  });
});

module.exports = router;