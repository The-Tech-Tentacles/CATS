const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const { logSecurity } = require('../utils/logger');
const config = require('../config');

/**
 * General Rate Limiting Middleware
 */
const generalRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for certain IPs or conditions
    return config.rateLimit.skipSuccessfulRequests && req.method === 'GET';
  },
  onLimitReached: (req, res, options) => {
    logSecurity('rate_limit_exceeded', 'medium', {
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      limit: options.max,
      window: options.windowMs
    });
  }
});

/**
 * Strict Rate Limiting for Authentication Endpoints
 */
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  onLimitReached: (req, res, options) => {
    logSecurity('auth_rate_limit_exceeded', 'high', {
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      limit: options.max
    });
  }
});

/**
 * Password Reset Rate Limiting
 */
const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later'
  },
  keyGenerator: (req) => {
    // Rate limit by email instead of IP for password reset
    return req.body.email || req.ip;
  },
  onLimitReached: (req, res, options) => {
    logSecurity('password_reset_rate_limit_exceeded', 'high', {
      ip_address: req.ip,
      email: req.body.email,
      user_agent: req.get('User-Agent')
    });
  }
});

/**
 * File Upload Rate Limiting
 */
const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 uploads per window
  message: {
    success: false,
    message: 'Too many file uploads, please try again later'
  },
  onLimitReached: (req, res, options) => {
    logSecurity('upload_rate_limit_exceeded', 'medium', {
      ip_address: req.ip,
      user_id: req.user?.id,
      user_agent: req.get('User-Agent')
    });
  }
});

/**
 * Slow Down Middleware for Suspicious Activity
 */
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per window at full speed
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
  onLimitReached: (req, res, options) => {
    logSecurity('speed_limit_applied', 'low', {
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      delay: options.delay
    });
  }
});

/**
 * Helmet Security Headers
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * Input Validation Middleware
 */
const validateInput = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logSecurity('input_validation_failed', 'medium', {
        ip_address: req.ip,
        user_id: req.user?.id,
        endpoint: req.originalUrl,
        errors: errors.array()
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    next();
  };
};

/**
 * SQL Injection Protection
 */
const sqlInjectionProtection = (req, res, next) => {
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /('|(\\')|(;)|(\\)|(\/\*)|(--)|(\*\/))/,
    /((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i
  ];

  const checkForSQLInjection = (obj, path = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            logSecurity('sql_injection_attempt', 'high', {
              ip_address: req.ip,
              user_id: req.user?.id,
              endpoint: req.originalUrl,
              field: currentPath,
              value: value.substring(0, 100) // Log first 100 chars
            });

            return res.status(400).json({
              success: false,
              message: 'Invalid input detected'
            });
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        const result = checkForSQLInjection(value, currentPath);
        if (result) return result;
      }
    }
  };

  // Check query parameters
  if (req.query && Object.keys(req.query).length > 0) {
    const result = checkForSQLInjection(req.query);
    if (result) return result;
  }

  // Check request body
  if (req.body && Object.keys(req.body).length > 0) {
    const result = checkForSQLInjection(req.body);
    if (result) return result;
  }

  next();
};

/**
 * XSS Protection
 */
const xssProtection = (req, res, next) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+src[\\s]*=[\\s]*["\']javascript:/gi
  ];

  const checkForXSS = (obj, path = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string') {
        for (const pattern of xssPatterns) {
          if (pattern.test(value)) {
            logSecurity('xss_attempt', 'high', {
              ip_address: req.ip,
              user_id: req.user?.id,
              endpoint: req.originalUrl,
              field: currentPath,
              value: value.substring(0, 100)
            });

            return res.status(400).json({
              success: false,
              message: 'Invalid input detected'
            });
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        const result = checkForXSS(value, currentPath);
        if (result) return result;
      }
    }
  };

  // Check request body
  if (req.body && Object.keys(req.body).length > 0) {
    const result = checkForXSS(req.body);
    if (result) return result;
  }

  next();
};

/**
 * CSRF Protection for State-Changing Operations
 */
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    logSecurity('csrf_token_mismatch', 'high', {
      ip_address: req.ip,
      user_id: req.user?.id,
      endpoint: req.originalUrl,
      method: req.method,
      has_token: !!token,
      has_session_token: !!sessionToken
    });

    return res.status(403).json({
      success: false,
      message: 'CSRF token mismatch'
    });
  }

  next();
};

/**
 * Suspicious Activity Detection
 */
const suspiciousActivityDetection = (req, res, next) => {
  const suspiciousIndicators = [];

  // Check for suspicious user agents
  const userAgent = req.get('User-Agent') || '';
  const suspiciousAgents = ['sqlmap', 'nikto', 'nmap', 'masscan', 'nessus'];
  
  if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    suspiciousIndicators.push('suspicious_user_agent');
  }

  // Check for suspicious headers
  const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-originating-ip'];
  suspiciousHeaders.forEach(header => {
    if (req.headers[header]) {
      suspiciousIndicators.push(`suspicious_header_${header}`);
    }
  });

  // Check for unusual request patterns
  if (req.originalUrl.length > 1000) {
    suspiciousIndicators.push('unusually_long_url');
  }

  if (JSON.stringify(req.body).length > 100000) {
    suspiciousIndicators.push('unusually_large_payload');
  }

  // Log suspicious activity
  if (suspiciousIndicators.length > 0) {
    logSecurity('suspicious_activity_detected', 'medium', {
      ip_address: req.ip,
      user_id: req.user?.id,
      endpoint: req.originalUrl,
      indicators: suspiciousIndicators,
      user_agent: userAgent
    });
  }

  next();
};

/**
 * Brute Force Protection
 */
const bruteForceProtection = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    // Clean old attempts
    for (const [ip, data] of attempts.entries()) {
      if (now - data.firstAttempt > windowMs) {
        attempts.delete(ip);
      }
    }

    const userAttempts = attempts.get(key);
    
    if (userAttempts && userAttempts.count >= maxAttempts) {
      logSecurity('brute_force_detected', 'high', {
        ip_address: req.ip,
        endpoint: req.originalUrl,
        attempts: userAttempts.count,
        window_start: new Date(userAttempts.firstAttempt)
      });

      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please try again later.'
      });
    }

    // Track failed attempts (this should be called from auth middleware on failure)
    req.recordFailedAttempt = () => {
      if (userAttempts) {
        userAttempts.count++;
      } else {
        attempts.set(key, {
          count: 1,
          firstAttempt: now
        });
      }
    };

    // Clear attempts on success
    req.clearFailedAttempts = () => {
      attempts.delete(key);
    };

    next();
  };
};

/**
 * IP Whitelist/Blacklist Middleware
 */
const ipFilter = (whitelist = [], blacklist = []) => {
  return (req, res, next) => {
    const clientIP = req.ip;

    // Check blacklist first
    if (blacklist.length > 0 && blacklist.includes(clientIP)) {
      logSecurity('blacklisted_ip_access', 'high', {
        ip_address: clientIP,
        endpoint: req.originalUrl,
        user_agent: req.get('User-Agent')
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check whitelist if configured
    if (whitelist.length > 0 && !whitelist.includes(clientIP)) {
      logSecurity('non_whitelisted_ip_access', 'medium', {
        ip_address: clientIP,
        endpoint: req.originalUrl,
        user_agent: req.get('User-Agent')
      });

      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    next();
  };
};

/**
 * Request Size Limiting
 */
const requestSizeLimit = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxBytes = typeof maxSize === 'string' ? 
      parseInt(maxSize.replace(/[^\d]/g, '')) * 1024 * 1024 : maxSize;

    if (contentLength > maxBytes) {
      logSecurity('request_size_exceeded', 'medium', {
        ip_address: req.ip,
        user_id: req.user?.id,
        endpoint: req.originalUrl,
        content_length: contentLength,
        max_allowed: maxBytes
      });

      return res.status(413).json({
        success: false,
        message: 'Request entity too large'
      });
    }

    next();
  };
};

module.exports = {
  generalRateLimit,
  authRateLimit,
  passwordResetRateLimit,
  uploadRateLimit,
  speedLimiter,
  securityHeaders,
  validateInput,
  sqlInjectionProtection,
  xssProtection,
  csrfProtection,
  suspiciousActivityDetection,
  bruteForceProtection,
  ipFilter,
  requestSizeLimit
};