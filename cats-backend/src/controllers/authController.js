const { User, Role, AuditLog } = require('../models');
const { generateToken, verifyRefreshToken, hashPassword } = require('../middleware/auth');
const { validateUserRegistration } = require('../utils/validation');
const { generateToken: generateRandomToken } = require('../utils/encryption');
const { logAuth, logSecurity } = require('../utils/logger');
const config = require('../config');

/**
 * User Registration
 */
const register = async (req, res) => {
  try {
    // Validate input data
    const validation = validateUserRegistration(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const userData = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        email: userData.email
      }
    });

    if (existingUser) {
      logSecurity('duplicate_registration_attempt', 'medium', {
        email: userData.email,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check for duplicate phone number
    const existingPhone = await User.findOne({
      where: {
        phone_number: userData.phone_number
      }
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: 'User with this phone number already exists'
      });
    }

    // Create user
    const user = await User.create({
      ...userData,
      password_hash: userData.password, // Will be hashed by model hook
      email_verification_token: generateRandomToken(),
      phone_verification_token: Math.floor(100000 + Math.random() * 900000).toString()
    });

    // Assign default citizen role
    const citizenRole = await Role.findOne({ where: { name: 'citizen' } });
    if (citizenRole) {
      await user.addRole(citizenRole);
    }

    // Log registration
    await AuditLog.create({
      user_id: user.id,
      action: 'create',
      resource_type: 'user',
      resource_id: user.id,
      description: 'User registered successfully',
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      metadata: {
        registration_method: 'web',
        email_domain: userData.email.split('@')[1]
      }
    });

    logAuth('user_registered', user.id, true, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Generate tokens
    const accessToken = generateToken(user, 'access');
    const refreshToken = generateToken(user, 'refresh');

    // TODO: Send verification emails/SMS
    // await sendVerificationEmail(user);
    // await sendVerificationSMS(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toSafeJSON(),
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: config.jwt.expiresIn
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    await AuditLog.create({
      action: 'create',
      resource_type: 'user',
      description: 'User registration failed',
      status: 'failure',
      error_message: error.message,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

/**
 * User Login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user with roles
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        }
      ]
    });

    if (!user) {
      logAuth('login_failed', null, false, {
        reason: 'user_not_found',
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Record failed attempt
      if (req.recordFailedAttempt) {
        req.recordFailedAttempt();
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      logSecurity('locked_account_login_attempt', 'medium', {
        user_id: user.id,
        email: user.email,
        locked_until: user.locked_until,
        ip_address: req.ip
      });

      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Verify password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      // Increment failed login attempts
      await user.incrementLoginAttempts();

      logAuth('login_failed', user.id, false, {
        reason: 'invalid_password',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Record failed attempt
      if (req.recordFailedAttempt) {
        req.recordFailedAttempt();
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check account status
    if (user.status !== 'active') {
      logSecurity('inactive_account_login_attempt', 'medium', {
        user_id: user.id,
        email: user.email,
        status: user.status,
        ip_address: req.ip
      });

      return res.status(403).json({
        success: false,
        message: 'Account is not active. Please contact support.'
      });
    }

    // Reset failed login attempts on successful login
    await user.resetLoginAttempts();
    await user.update({ last_login: new Date() });

    // Clear failed attempts
    if (req.clearFailedAttempts) {
      req.clearFailedAttempts();
    }

    // Generate tokens
    const accessToken = generateToken(user, 'access');
    const refreshToken = generateToken(user, 'refresh');

    // Log successful login
    await AuditLog.create({
      user_id: user.id,
      action: 'login',
      resource_type: 'user',
      resource_id: user.id,
      description: 'User logged in successfully',
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      metadata: {
        login_method: 'password',
        roles: user.roles.map(role => role.name)
      }
    });

    logAuth('login_successful', user.id, true, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toSafeJSON(),
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: config.jwt.expiresIn
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);

    await AuditLog.create({
      action: 'login',
      resource_type: 'user',
      description: 'Login failed due to system error',
      status: 'error',
      error_message: error.message,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

/**
 * Refresh Access Token
 */
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refresh_token);
    
    // Get user
    const user = await User.findByPk(decoded.userId, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        }
      ]
    });

    if (!user || user.status !== 'active') {
      logSecurity('invalid_refresh_token', 'medium', {
        user_id: decoded.userId,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newAccessToken = generateToken(user, 'access');

    // Log token refresh
    await AuditLog.create({
      user_id: user.id,
      action: 'refresh_token',
      resource_type: 'user',
      resource_id: user.id,
      description: 'Access token refreshed',
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        access_token: newAccessToken,
        expires_in: config.jwt.expiresIn
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      logSecurity('invalid_refresh_token_format', 'medium', {
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        error: error.message
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

/**
 * User Logout
 */
const logout = async (req, res) => {
  try {
    // Log logout
    await AuditLog.create({
      user_id: req.user.id,
      action: 'logout',
      resource_type: 'user',
      resource_id: req.user.id,
      description: 'User logged out',
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    logAuth('logout', req.user.id, true, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // TODO: Implement token blacklisting for enhanced security
    // await blacklistToken(req.token);

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

/**
 * Forgot Password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    // Always return success to prevent email enumeration
    const response = {
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent'
    };

    if (user) {
      // Generate reset token
      const resetToken = generateRandomToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await user.update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires
      });

      // Log password reset request
      await AuditLog.create({
        user_id: user.id,
        action: 'password_reset_request',
        resource_type: 'user',
        resource_id: user.id,
        description: 'Password reset requested',
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      logSecurity('password_reset_requested', 'low', {
        user_id: user.id,
        email: user.email,
        ip_address: req.ip
      });

      // TODO: Send password reset email
      // await sendPasswordResetEmail(user, resetToken);
    } else {
      logSecurity('password_reset_invalid_email', 'low', {
        email,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });
    }

    res.json(response);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset request failed'
    });
  }
};

/**
 * Reset Password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Validate password strength
    const { validatePasswordStrength } = require('../utils/validation');
    const passwordValidation = validatePasswordStrength(password);
    
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.feedback
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        password_reset_token: token,
        password_reset_expires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      logSecurity('invalid_password_reset_token', 'medium', {
        token: token.substring(0, 8) + '...',
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password and clear reset token
    await user.update({
      password_hash: password, // Will be hashed by model hook
      password_reset_token: null,
      password_reset_expires: null,
      login_attempts: 0, // Reset failed login attempts
      locked_until: null
    });

    // Log password reset
    await AuditLog.create({
      user_id: user.id,
      action: 'password_reset',
      resource_type: 'user',
      resource_id: user.id,
      description: 'Password reset successfully',
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    logSecurity('password_reset_completed', 'medium', {
      user_id: user.id,
      email: user.email,
      ip_address: req.ip
    });

    // TODO: Send password reset confirmation email
    // await sendPasswordResetConfirmation(user);

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
};

/**
 * Verify Email
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: { email_verification_token: token }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    await user.update({
      email_verified: true,
      email_verification_token: null
    });

    // Log email verification
    await AuditLog.create({
      user_id: user.id,
      action: 'email_verification',
      resource_type: 'user',
      resource_id: user.id,
      description: 'Email verified successfully',
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
};

/**
 * Verify Phone
 */
const verifyPhone = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required'
      });
    }

    const user = await User.findOne({
      where: {
        id: req.user.id,
        phone_verification_token: code
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    await user.update({
      phone_verified: true,
      phone_verification_token: null
    });

    // Log phone verification
    await AuditLog.create({
      user_id: user.id,
      action: 'phone_verification',
      resource_type: 'user',
      resource_id: user.id,
      description: 'Phone verified successfully',
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Phone verified successfully'
    });
  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Phone verification failed'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  verifyPhone
};