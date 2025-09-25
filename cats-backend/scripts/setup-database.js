const { sequelize } = require("../src/config/database");

async function setupDatabase() {
  try {
    console.log("🔄 Setting up database...");

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connection verified");

    // Force sync all models (create tables) - this will ignore complex static methods for now
    console.log("🔄 Creating database tables...");
    await sequelize.sync({ force: false, alter: true });
    console.log("✅ Database tables created/verified");

    console.log("🎉 Database setup completed successfully!");
    console.log('📋 Next step: Run "npm run seed" to populate initial data');
    process.exit(0);
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    console.log("\n💡 Tip: Make sure your DATABASE_URL in .env is correct");
    process.exit(1);
  }
}

setupDatabase();
