const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');
const config = require('../config');
const { logAuth, logSecurity } = require('../utils/logger');

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      logSecurity('missing_auth_token', 'low', {
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        endpoint: req.originalUrl
      });
      
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Get user with roles and permissions
    const user = await User.findByPk(decoded.userId, {
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
      logSecurity('invalid_user_token', 'medium', {
        user_id: decoded.userId,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      logSecurity('inactive_user_access', 'medium', {
        user_id: user.id,
        user_status: user.status,
        ip_address: req.ip
      });
      
      return res.status(401).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Check if user is locked
    if (user.isLocked()) {
      logSecurity('locked_user_access', 'medium', {
        user_id: user.id,
        locked_until: user.locked_until,
        ip_address: req.ip
      });
      
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked'
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;

    // Log successful authentication
    logAuth('token_verified', user.id, true, {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logSecurity('expired_token_access', 'low', {
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        endpoint: req.originalUrl
      });
      
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      logSecurity('invalid_token_access', 'medium', {
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        error: error.message
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    logSecurity('auth_middleware_error', 'high', {
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      error: error.message
    });

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is provided, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findByPk(decoded.userId, {
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

    if (user && user.status === 'active' && !user.isLocked()) {
      req.user = user;
      req.token = token;
    }

    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

/**
 * Role-based Authorization Middleware
 * Checks if user has required roles
 */
const requireRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRoles = req.user.roles.map(role => role.name);
    const hasRequiredRole = roles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      logSecurity('insufficient_role_access', 'medium', {
        user_id: req.user.id,
        required_roles: roles,
        user_roles: userRoles,
        endpoint: req.originalUrl,
        ip_address: req.ip
      });

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Permission-based Authorization Middleware
 * Checks if user has required permissions
 */
const requirePermissions = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userPermissions = [];
    req.user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        userPermissions.push(permission.name);
      });
    });

    const hasRequiredPermissions = permissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasRequiredPermissions) {
      logSecurity('insufficient_permission_access', 'medium', {
        user_id: req.user.id,
        required_permissions: permissions,
        user_permissions: userPermissions,
        endpoint: req.originalUrl,
        ip_address: req.ip
      });

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Resource Ownership Middleware
 * Checks if user owns the resource or has admin privileges
 */
const requireOwnership = (resourceParam = 'id', userField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admin and super admin can access any resource
    const userRoles = req.user.roles.map(role => role.name);
    if (userRoles.includes('admin') || userRoles.includes('super_admin')) {
      return next();
    }

    // Check ownership
    const resourceId = req.params[resourceParam];
    const userId = req.user.id;

    // This would need to be implemented based on the specific resource
    // For now, we'll add the check to the request for the controller to handle
    req.ownershipCheck = {
      resourceId,
      userId,
      userField
    };

    next();
  };
};

/**
 * Admin Only Middleware
 * Restricts access to admin and super admin roles only
 */
const adminOnly = requireRoles(['admin', 'super_admin']);

/**
 * Super Admin Only Middleware
 * Restricts access to super admin role only
 */
const superAdminOnly = requireRoles(['super_admin']);

/**
 * Officer or Above Middleware
 * Allows access to officers, admins, and super admins
 */
const officerOrAbove = requireRoles(['officer', 'admin', 'super_admin']);

/**
 * Verified User Middleware
 * Requires user to have verified email and phone
 */
const requireVerifiedUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.email_verified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required'
    });
  }

  if (!req.user.phone_verified) {
    return res.status(403).json({
      success: false,
      message: 'Phone verification required'
    });
  }

  next();
};

/**
 * Rate Limiting by User
 * Applies different rate limits based on user role
 */
const userBasedRateLimit = (req, res, next) => {
  if (!req.user) {
    return next();
  }

  const userRoles = req.user.roles.map(role => role.name);
  
  // Set rate limit based on highest role
  if (userRoles.includes('super_admin')) {
    req.rateLimit = { max: 1000, windowMs: 15 * 60 * 1000 }; // 1000 requests per 15 minutes
  } else if (userRoles.includes('admin')) {
    req.rateLimit = { max: 500, windowMs: 15 * 60 * 1000 }; // 500 requests per 15 minutes
  } else if (userRoles.includes('officer')) {
    req.rateLimit = { max: 300, windowMs: 15 * 60 * 1000 }; // 300 requests per 15 minutes
  } else {
    req.rateLimit = { max: 100, windowMs: 15 * 60 * 1000 }; // 100 requests per 15 minutes
  }

  next();
};

/**
 * Generate JWT Token
 * @param {Object} user - User object
 * @param {string} type - Token type ('access' or 'refresh')
 * @returns {string} - JWT token
 */
const generateToken = (user, type = 'access') => {
  const payload = {
    userId: user.id,
    email: user.email,
    type
  };

  const options = {
    expiresIn: type === 'refresh' ? config.jwt.refreshExpiresIn : config.jwt.expiresIn,
    issuer: 'cats-backend',
    audience: 'cats-frontend'
  };

  const secret = type === 'refresh' ? config.jwt.refreshSecret : config.jwt.secret;

  return jwt.sign(payload, secret, options);
};

/**
 * Verify Refresh Token
 * @param {string} token - Refresh token
 * @returns {Object} - Decoded token payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

/**
 * Check if user has specific permission
 * @param {Object} user - User object with roles and permissions
 * @param {string} permission - Permission name to check
 * @returns {boolean} - True if user has permission
 */
const hasPermission = (user, permission) => {
  if (!user || !user.roles) return false;

  for (const role of user.roles) {
    if (role.permissions) {
      for (const perm of role.permissions) {
        if (perm.name === permission) return true;
      }
    }
  }

  return false;
};

/**
 * Check if user has specific role
 * @param {Object} user - User object with roles
 * @param {string|Array} roles - Role name(s) to check
 * @returns {boolean} - True if user has role
 */
const hasRole = (user, roles) => {
  if (!user || !user.roles) return false;

  const roleNames = user.roles.map(role => role.name);
  const requiredRoles = Array.isArray(roles) ? roles : [roles];

  return requiredRoles.some(role => roleNames.includes(role));
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRoles,
  requirePermissions,
  requireOwnership,
  adminOnly,
  superAdminOnly,
  officerOrAbove,
  requireVerifiedUser,
  userBasedRateLimit,
  generateToken,
  verifyRefreshToken,
  hasPermission,
  hasRole
};