const { sequelize } = require("../config/database");
const bcrypt = require("bcryptjs");

async function seedInitialData() {
  try {
    console.log("🌱 Seeding initial data...");

    // Insert roles
    console.log("📋 Creating roles...");
    await sequelize.query(`
      INSERT INTO roles (id, name, description) VALUES 
      (gen_random_uuid(), 'super_admin', 'System Administrator with full access'),
      (gen_random_uuid(), 'admin', 'Administrator with management access'),
      (gen_random_uuid(), 'officer', 'Police Officer handling cases'),
      (gen_random_uuid(), 'citizen', 'General public user')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Insert basic permissions
    console.log("🔐 Creating permissions...");
    await sequelize.query(`
      INSERT INTO permissions (id, name, description, resource, action) VALUES 
      (gen_random_uuid(), 'user.create', 'Create new users', 'user', 'create'),
      (gen_random_uuid(), 'user.read', 'View user details', 'user', 'read'),
      (gen_random_uuid(), 'user.update', 'Update user information', 'user', 'update'),
      (gen_random_uuid(), 'user.delete', 'Delete users', 'user', 'delete'),
      (gen_random_uuid(), 'complaint.create', 'Create new complaints', 'complaint', 'create'),
      (gen_random_uuid(), 'complaint.read', 'View complaints', 'complaint', 'read'),
      (gen_random_uuid(), 'complaint.update', 'Update complaints', 'complaint', 'update'),
      (gen_random_uuid(), 'complaint.delete', 'Delete complaints', 'complaint', 'delete'),
      (gen_random_uuid(), 'admin.access', 'Access admin panel', 'admin', 'access')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Insert complaint types
    console.log("📋 Creating complaint types...");
    await sequelize.query(`
      INSERT INTO complaint_types (id, name, description, category, sla_hours) VALUES 
      (gen_random_uuid(), 'Cyber Fraud', 'Online fraud and scam complaints', 'financial', 48),
      (gen_random_uuid(), 'Identity Theft', 'Identity theft and impersonation cases', 'identity', 72),
      (gen_random_uuid(), 'Online Harassment', 'Cyberbullying and online harassment', 'harassment', 24),
      (gen_random_uuid(), 'Data Breach', 'Unauthorized data access or breach', 'security', 24),
      (gen_random_uuid(), 'Phishing', 'Phishing emails and fake websites', 'financial', 48),
      (gen_random_uuid(), 'Malware Attack', 'Virus, malware, and ransomware attacks', 'security', 48)
      ON CONFLICT (name) DO NOTHING;
    `);

    // Create admin user
    console.log("👤 Creating admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 12);
    await sequelize.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, employee_id, department, designation, is_active, email_verified) 
      VALUES (gen_random_uuid(), 'admin@cybercrime.gov.in', '${hashedPassword}', 'System', 'Administrator', 'ADMIN001', 'IT', 'System Administrator', true, true)
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log("✅ Initial data seeded successfully!");
    console.log("");
    console.log("🎉 Database is ready!");
    console.log("");
    console.log("📋 Default Admin Login:");
    console.log("   Email: admin@cybercrime.gov.in");
    console.log("   Password: admin123");
    console.log("");
    console.log("🚀 You can now start the server with: npm start");
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  }
}

seedInitialData();
