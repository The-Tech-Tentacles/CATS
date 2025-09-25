const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  verifyPhone
} = require('../controllers/authController');

const { authenticateToken } = require('../middleware/auth');
const {
  authRateLimit,
  passwordResetRateLimit,
  validateInput,
  bruteForceProtection
} = require('../middleware/security');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name must be 2-50 characters and contain only letters'),
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name must be 2-50 characters and contain only letters'),
  body('phone_number')
    .isMobilePhone('en-IN')
    .withMessage('Valid Indian phone number is required'),
  body('aadhaar_number')
    .optional()
    .isLength({ min: 12, max: 12 })
    .isNumeric()
    .withMessage('Aadhaar number must be 12 digits'),
  body('pan_number')
    .optional()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Invalid PAN number format')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

const refreshTokenValidation = [
  body('refresh_token')
    .notEmpty()
    .withMessage('Refresh token is required')
];

const verifyPhoneValidation = [
  body('code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Verification code must be 6 digits')
];

// Apply brute force protection to auth routes
const authBruteForce = bruteForceProtection(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register',
  authRateLimit,
  authBruteForce,
  validateInput(registerValidation),
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
  authRateLimit,
  authBruteForce,
  validateInput(loginValidation),
  login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh',
  authRateLimit,
  validateInput(refreshTokenValidation),
  refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout',
  authenticateToken,
  logout
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password',
  passwordResetRateLimit,
  validateInput(forgotPasswordValidation),
  forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password',
  authRateLimit,
  validateInput(resetPasswordValidation),
  resetPassword
);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify email address
 * @access  Public
 */
router.get('/verify-email/:token', verifyEmail);

/**
 * @route   POST /api/auth/verify-phone
 * @desc    Verify phone number
 * @access  Private
 */
router.post('/verify-phone',
  authenticateToken,
  validateInput(verifyPhoneValidation),
  verifyPhone
);

/**
 * @route   POST /api/auth/resend-email-verification
 * @desc    Resend email verification
 * @access  Private
 */
router.post('/resend-email-verification',
  authenticateToken,
  authRateLimit,
  async (req, res) => {
    try {
      const user = req.user;

      if (user.email_verified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified'
        });
      }

      // Generate new verification token
      const { generateToken } = require('../utils/encryption');
      const verificationToken = generateToken();

      await user.update({
        email_verification_token: verificationToken
      });

      // TODO: Send verification email
      // await sendVerificationEmail(user);

      res.json({
        success: true,
        message: 'Verification email sent'
      });
    } catch (error) {
      console.error('Resend email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }
  }
);

/**
 * @route   POST /api/auth/resend-phone-verification
 * @desc    Resend phone verification code
 * @access  Private
 */
router.post('/resend-phone-verification',
  authenticateToken,
  authRateLimit,
  async (req, res) => {
    try {
      const user = req.user;

      if (user.phone_verified) {
        return res.status(400).json({
          success: false,
          message: 'Phone is already verified'
        });
      }

      // Generate new verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      await user.update({
        phone_verification_token: verificationCode
      });

      // TODO: Send SMS verification code
      // await sendSMSVerification(user, verificationCode);

      res.json({
        success: true,
        message: 'Verification code sent'
      });
    } catch (error) {
      console.error('Resend phone verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification code'
      });
    }
  }
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me',
  authenticateToken,
  async (req, res) => {
    try {
      const { User, Role, Permission } = require('../models');
      
      const user = await User.findByPk(req.user.id, {
        include: [
          {
            model: Role,
            as: 'roles',
            through: { attributes: [] },
            include: [
              {
                model: Permission,
                as: 'permissions',
                through: { attributes: [] }
              }
            ]
          }
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user: user.toSafeJSON()
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user profile'
      });
    }
  }
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password',
  authenticateToken,
  authRateLimit,
  validateInput([
    body('current_password')
      .notEmpty()
      .withMessage('Current password is required'),
    body('new_password')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ]),
  async (req, res) => {
    try {
      const { current_password, new_password } = req.body;
      const user = req.user;

      // Verify current password
      const isValidPassword = await user.validatePassword(current_password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      await user.update({
        password_hash: new_password // Will be hashed by model hook
      });

      // Log password change
      const { AuditLog } = require('../models');
      await AuditLog.create({
        user_id: user.id,
        action: 'password_change',
        resource_type: 'user',
        resource_id: user.id,
        description: 'Password changed successfully',
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }
);

module.exports = router;