#!/usr/bin/env node

/**
 * CATS Backend - Production Setup
 * Sets up the backend for production deployment
 */

const fs = require("fs");
const path = require("path");

function log(message, type = "info") {
  const colors = {
    info: "\x1b[36m",
    success: "\x1b[32m",
    warning: "\x1b[33m",
    error: "\x1b[31m",
    reset: "\x1b[0m",
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function checkEnvironment() {
  log("🔍 Checking production environment...", "info");

  const requiredEnvVars = [
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "ENCRYPTION_KEY",
  ];

  const missing = requiredEnvVars.filter((env) => !process.env[env]);

  if (missing.length > 0) {
    log(`❌ Missing required environment variables:`, "error");
    missing.forEach((env) => log(`   - ${env}`, "error"));
    return false;
  }

  log("✅ All required environment variables are set", "success");
  return true;
}

function validateSecrets() {
  log("🔐 Validating security configuration...", "info");

  const checks = [
    {
      name: "JWT Secret Length",
      value: process.env.JWT_SECRET,
      check: (val) => val && val.length >= 32,
      message: "JWT_SECRET should be at least 32 characters",
    },
    {
      name: "Refresh Secret Length",
      value: process.env.JWT_REFRESH_SECRET,
      check: (val) => val && val.length >= 32,
      message: "JWT_REFRESH_SECRET should be at least 32 characters",
    },
    {
      name: "Encryption Key Length",
      value: process.env.ENCRYPTION_KEY,
      check: (val) => val && val.length >= 32,
      message: "ENCRYPTION_KEY should be at least 32 characters",
    },
  ];

  let allValid = true;

  checks.forEach((check) => {
    if (check.check(check.value)) {
      log(`✅ ${check.name}`, "success");
    } else {
      log(`❌ ${check.name}: ${check.message}`, "error");
      allValid = false;
    }
  });

  return allValid;
}

function createProductionEnv() {
  log("📝 Creating production environment template...", "info");

  const prodEnvTemplate = `# CATS Backend - Production Environment
# Copy this file to .env and update with your actual values

# Database Configuration (NeonDB or other PostgreSQL)
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require

# JWT Configuration (Generate secure random strings)
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_here
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_minimum_32_characters_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption Configuration
ENCRYPTION_KEY=your_32_character_encryption_key_here
ENCRYPTION_ALGORITHM=aes-256-gcm

# Server Configuration
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Security Configuration
CORS_ORIGIN=https://yourdomain.com
TRUST_PROXY=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx,txt,mp4,avi,mov
UPLOAD_PATH=./uploads
VIRUS_SCAN_ENABLED=true

# Email Configuration (Production SMTP)
SMTP_HOST=smtp.yourmailserver.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your_production_email@domain.com
SMTP_PASSWORD=your_email_password
FROM_EMAIL=noreply@cybercrime.gov.in
FROM_NAME=Cyber Crime Branch

# SMS Configuration (Production Twilio)
TWILIO_ACCOUNT_SID=your_production_twilio_sid
TWILIO_AUTH_TOKEN=your_production_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Redis Configuration (If using Redis)
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Logging Configuration
LOG_LEVEL=warn
LOG_FILE=logs/cats.log

# Application Configuration
APP_NAME=CATS Backend
APP_DESCRIPTION=Complaint and Application Tracking System
ADMIN_EMAIL=admin@cybercrime.gov.in
SUPPORT_EMAIL=support@cybercrime.gov.in
`;

  fs.writeFileSync(".env.production", prodEnvTemplate);
  log("✅ Created .env.production template", "success");
}

async function main() {
  log("🚀 CATS Backend - Production Setup", "info");
  log("==================================", "info");

  try {
    // Load environment variables
    require("dotenv").config();

    // Check environment
    const envOk = checkEnvironment();
    const secretsOk = validateSecrets();

    if (!envOk || !secretsOk) {
      log("", "info");
      log("❌ Production setup validation failed", "error");
      log(
        "💡 Please fix the issues above before deploying to production",
        "warning"
      );
      process.exit(1);
    }

    // Create production template
    createProductionEnv();

    log("", "info");
    log("🎉 Production setup validation passed!", "success");
    log("", "info");
    log("📋 Production deployment checklist:", "info");
    log("  ✅ Environment variables validated", "success");
    log("  ✅ Security configuration checked", "success");
    log("  ✅ Production template created", "success");
    log("", "info");
    log("🚀 Ready for production deployment!", "success");
    log("", "info");
    log("📝 Next steps:", "info");
    log("  1. Review .env.production template", "info");
    log("  2. Update production values", "info");
    log("  3. Deploy to your production environment", "info");
    log("  4. Run: npm run setup on production server", "info");
    log("  5. Start with: npm start", "info");
  } catch (error) {
    log(`❌ Production setup failed: ${error.message}`, "error");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, checkEnvironment, validateSecrets };
