const { sequelize } = require('../models');
const seedRoles = require('./01-roles');
const seedPermissions = require('./02-permissions');
const seedRolePermissions = require('./03-role-permissions');
const seedUsers = require('./04-users');
const seedComplaintTypes = require('./05-complaint-types');
const seedSystemSettings = require('./06-system-settings');

/**
 * Run all seeders in order
 */
const runSeeders = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Ensure database is connected
    await sequelize.authenticate();
    console.log('✅ Database connection verified');

    // Sync database models
    await sequelize.sync({ force: false });
    console.log('✅ Database models synchronized');

    // Run seeders in order
    await seedRoles();
    await seedPermissions();
    await seedRolePermissions();
    await seedUsers();
    await seedComplaintTypes();
    await seedSystemSettings();

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

/**
 * Clear all data and reseed
 */
const resetAndSeed = async () => {
  try {
    console.log('🔄 Resetting database...');

    // Sync with force to recreate tables
    await sequelize.sync({ force: true });
    console.log('✅ Database reset completed');

    // Run seeders
    await runSeeders();
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
};

// Run seeders if this file is executed directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'reset') {
    resetAndSeed()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    runSeeders()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

module.exports = {
  runSeeders,
  resetAndSeed
};