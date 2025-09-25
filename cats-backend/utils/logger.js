const winston = require("winston");
const path = require("path");
const config = require("../config");

// Create logs directory if it doesn't exist
const fs = require("fs");
const logsDir = path.dirname(config.logging.file);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for log messages
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    if (stack) {
      log += `\nStack: ${stack}`;
    }

    if (Object.keys(meta).length > 0) {
      log += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  })
);

// Create Winston logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: {
    service: "cats-backend",
    environment: config.server.env,
  },
  transports: [
    // File transport for all logs
    new winston.transports.File({
      filename: config.logging.file,
      maxsize: parseInt(config.logging.maxSize.replace("m", "")) * 1024 * 1024,
      maxFiles: config.logging.maxFiles,
      tailable: true,
    }),

    // Separate file for error logs
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: parseInt(config.logging.maxSize.replace("m", "")) * 1024 * 1024,
      maxFiles: config.logging.maxFiles,
      tailable: true,
    }),

    // Separate file for security logs
    new winston.transports.File({
      filename: path.join(logsDir, "security.log"),
      level: "warn",
      maxsize: parseInt(config.logging.maxSize.replace("m", "")) * 1024 * 1024,
      maxFiles: config.logging.maxFiles,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          if (meta.type === "security" || meta.category === "security") {
            return `${timestamp} [SECURITY-${level.toUpperCase()}]: ${message} ${JSON.stringify(
              meta
            )}`;
          }
          return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        })
      ),
    }),
  ],

  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "exceptions.log"),
      maxsize: parseInt(config.logging.maxSize.replace("m", "")) * 1024 * 1024,
      maxFiles: config.logging.maxFiles,
    }),
  ],

  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "rejections.log"),
      maxsize: parseInt(config.logging.maxSize.replace("m", "")) * 1024 * 1024,
      maxFiles: config.logging.maxFiles,
    }),
  ],
});

// Add console transport for development
if (config.server.env !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          let log = `${timestamp} ${level}: ${message}`;
          if (stack) {
            log += `\n${stack}`;
          }
          return log;
        })
      ),
    })
  );
}

// Helper functions for structured logging
const logHelpers = {
  /**
   * Log user authentication events
   */
  logAuth: (action, userId, success, details = {}) => {
    logger.info("Authentication event", {
      type: "authentication",
      action,
      user_id: userId,
      success,
      ip_address: details.ip,
      user_agent: details.userAgent,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log security events
   */
  logSecurity: (event, severity, details = {}) => {
    logger.warn("Security event", {
      type: "security",
      category: "security",
      event,
      severity,
      ...details,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log API requests
   */
  logRequest: (req, res, responseTime) => {
    const logData = {
      type: "api_request",
      method: req.method,
      url: req.originalUrl,
      status_code: res.statusCode,
      response_time: responseTime,
      ip_address: req.ip,
      user_agent: req.get("User-Agent"),
      user_id: req.user?.id,
      request_id: req.id,
      timestamp: new Date().toISOString(),
    };

    if (res.statusCode >= 400) {
      logger.error("API request failed", logData);
    } else {
      logger.info("API request", logData);
    }
  },

  /**
   * Log database operations
   */
  logDatabase: (operation, table, success, details = {}) => {
    const logData = {
      type: "database",
      operation,
      table,
      success,
      ...details,
      timestamp: new Date().toISOString(),
    };

    if (success) {
      logger.info("Database operation", logData);
    } else {
      logger.error("Database operation failed", logData);
    }
  },

  /**
   * Log file operations
   */
  logFile: (operation, filename, success, details = {}) => {
    const logData = {
      type: "file_operation",
      operation,
      filename,
      success,
      ...details,
      timestamp: new Date().toISOString(),
    };

    if (success) {
      logger.info("File operation", logData);
    } else {
      logger.error("File operation failed", logData);
    }
  },

  /**
   * Log business events
   */
  logBusiness: (event, entityType, entityId, details = {}) => {
    logger.info("Business event", {
      type: "business",
      event,
      entity_type: entityType,
      entity_id: entityId,
      ...details,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log system events
   */
  logSystem: (event, level = "info", details = {}) => {
    logger[level]("System event", {
      type: "system",
      event,
      ...details,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log compliance events
   */
  logCompliance: (event, entityType, entityId, details = {}) => {
    logger.info("Compliance event", {
      type: "compliance",
      event,
      entity_type: entityType,
      entity_id: entityId,
      ...details,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log performance metrics
   */
  logPerformance: (metric, value, details = {}) => {
    logger.info("Performance metric", {
      type: "performance",
      metric,
      value,
      ...details,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log errors with context
   */
  logError: (error, context = {}) => {
    logger.error("Application error", {
      type: "error",
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log data access events for compliance
   */
  logDataAccess: (userId, dataType, action, entityId, details = {}) => {
    logger.info("Data access event", {
      type: "data_access",
      category: "compliance",
      user_id: userId,
      data_type: dataType,
      action,
      entity_id: entityId,
      ...details,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log notification events
   */
  logNotification: (type, recipient, channel, success, details = {}) => {
    const logData = {
      type: "notification",
      notification_type: type,
      recipient,
      channel,
      success,
      ...details,
      timestamp: new Date().toISOString(),
    };

    if (success) {
      logger.info("Notification sent", logData);
    } else {
      logger.error("Notification failed", logData);
    }
  },
};

// Create request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Generate unique request ID
  req.id = require("uuid").v4();

  // Log request start
  logger.info("Request started", {
    type: "request_start",
    method: req.method,
    url: req.originalUrl,
    ip_address: req.ip,
    user_agent: req.get("User-Agent"),
    request_id: req.id,
    timestamp: new Date().toISOString(),
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (...args) {
    const responseTime = Date.now() - start;
    logHelpers.logRequest(req, res, responseTime);
    originalEnd.apply(this, args);
  };

  next();
};

// Error logger middleware
const errorLogger = (error, req, res, next) => {
  logHelpers.logError(error, {
    request_id: req.id,
    method: req.method,
    url: req.originalUrl,
    user_id: req.user?.id,
    ip_address: req.ip,
  });

  next(error);
};

// Security logger middleware
const securityLogger = (event, severity = "medium") => {
  return (req, res, next) => {
    logHelpers.logSecurity(event, severity, {
      request_id: req.id,
      method: req.method,
      url: req.originalUrl,
      user_id: req.user?.id,
      ip_address: req.ip,
      user_agent: req.get("User-Agent"),
    });

    next();
  };
};

module.exports = {
  logger,
  requestLogger,
  errorLogger,
  securityLogger,
  ...logHelpers,
};
