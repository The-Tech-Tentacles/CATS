#!/usr/bin/env node

/**
 * CATS Backend - Complete Setup Script
 * This script sets up the entire CATS backend from scratch
 */

const { execSync } = require("child_process");
const path = require("path");

const scripts = {
  testDb: "../src/config/database",
  createTables: "./create-tables.js",
  seedData: "./seed-data.js",
};

function log(message, type = "info") {
  const timestamp = new Date().toISOString();
  const colors = {
    info: "\x1b[36m", // Cyan
    success: "\x1b[32m", // Green
    warning: "\x1b[33m", // Yellow
    error: "\x1b[31m", // Red
    reset: "\x1b[0m", // Reset
  };

  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

async function testConnection() {
  try {
    log("🔍 Testing database connection...", "info");
    const { testConnection } = require(scripts.testDb);
    await testConnection();
    log("✅ Database connection successful", "success");
    return true;
  } catch (error) {
    log(`❌ Database connection failed: ${error.message}`, "error");
    return false;
  }
}

async function runScript(scriptPath, description) {
  try {
    log(`🔄 ${description}...`, "info");

    // Import and run the script
    const scriptModule = require(scriptPath);

    // If the script exports a function, call it
    if (typeof scriptModule === "function") {
      await scriptModule();
    }

    log(`✅ ${description} completed`, "success");
    return true;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, "error");
    return false;
  }
}

async function main() {
  log("🚀 Starting CATS Backend Setup", "info");
  log("================================", "info");

  try {
    // Step 1: Test database connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      log("💡 Make sure your DATABASE_URL in .env is correct", "warning");
      process.exit(1);
    }

    // Step 2: Create tables
    log("📋 Creating database tables...", "info");
    execSync("node create-tables.js", {
      cwd: __dirname,
      stdio: "inherit",
    });

    // Step 3: Seed data
    log("🌱 Seeding initial data...", "info");
    execSync("node seed-data.js", {
      cwd: __dirname,
      stdio: "inherit",
    });

    log("", "info");
    log("🎉 CATS Backend setup completed successfully!", "success");
    log("", "info");
    log("📋 Next steps:", "info");
    log("  1. Start the server: npm start", "info");
    log("  2. Test health check: curl http://localhost:3000/health", "info");
    log("  3. Access admin panel with:", "info");
    log("     Email: admin@cybercrime.gov.in", "info");
    log("     Password: admin123", "info");
    log("", "info");
  } catch (error) {
    log(`❌ Setup failed: ${error.message}`, "error");
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, testConnection };
