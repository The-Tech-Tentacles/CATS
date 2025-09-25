require('dotenv').config();

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    trustProxy: process.env.TRUST_PROXY === 'true'
  },

  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'cats_db',
    user: process.env.DB_USER || 'cats_user',
    password: process.env.DB_PASSWORD || 'password',
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: process.env.DB_LOGGING === 'true'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_super_secure_jwt_secret_key_here',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_super_secure_refresh_secret_key_here',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // Encryption Configuration
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'your_32_character_encryption_key_here',
    algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm'
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt', 'mp4', 'avi', 'mov'],
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    virusScanEnabled: process.env.VIRUS_SCAN_ENABLED === 'true'
  },

  // Email Configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    },
    from: {
      email: process.env.FROM_EMAIL || 'noreply@cybercrime.gov.in',
      name: process.env.FROM_NAME || 'Cyber Crime Branch'
    }
  },

  // SMS Configuration
  sms: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER
    }
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB) || 0
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS === 'true'
  },

  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    sessionSecret: process.env.SESSION_SECRET || 'your_session_secret_key_here',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001'
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/cats.log',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5
  },

  // SLA Configuration (in hours)
  sla: {
    highPriority: parseInt(process.env.SLA_HIGH_PRIORITY) || 24,
    mediumPriority: parseInt(process.env.SLA_MEDIUM_PRIORITY) || 72,
    lowPriority: parseInt(process.env.SLA_LOW_PRIORITY) || 168
  },

  // Admin Configuration
  admin: {
    email: process.env.SUPER_ADMIN_EMAIL || 'admin@cybercrime.gov.in',
    password: process.env.SUPER_ADMIN_PASSWORD || 'SecureAdminPassword123!'
  },

  // External Services
  externalServices: {
    mlClassificationUrl: process.env.ML_CLASSIFICATION_SERVICE_URL || 'http://localhost:5000/classify',
    backgroundCheckUrl: process.env.BACKGROUND_CHECK_API_URL || 'https://api.backgroundcheck.gov.in',
    governmentApiKey: process.env.GOVERNMENT_API_KEY
  },

  // Analytics Configuration
  analytics: {
    enabled: process.env.ENABLE_ANALYTICS === 'true',
    retentionDays: parseInt(process.env.ANALYTICS_RETENTION_DAYS) || 365,
    performanceMonitoring: process.env.ENABLE_PERFORMANCE_MONITORING === 'true'
  },

  // Backup Configuration
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true',
    schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
    location: process.env.BACKUP_LOCATION || './backups'
  }
};

// Validate required configuration
const validateConfig = () => {
  const required = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'ENCRYPTION_KEY',
    'DB_PASSWORD'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }
};

// Only validate in production
if (process.env.NODE_ENV === 'production') {
  validateConfig();
}

module.exports = config;