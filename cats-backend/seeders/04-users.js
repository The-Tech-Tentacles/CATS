const { User, Role, UserRole } = require('../models');
const config = require('../config');

const users = [
  {
    email: config.admin.email,
    password: config.admin.password,
    first_name: 'Super',
    last_name: 'Administrator',
    phone_number: '+919999999999',
    email_verified: true,
    phone_verified: true,
    status: 'active',
    role: 'super_admin'
  },
  {
    email: 'admin@cybercrime.gov.in',
    password: 'AdminPassword123!',
    first_name: 'System',
    last_name: 'Administrator',
    phone_number: '+919999999998',
    email_verified: true,
    phone_verified: true,
    status: 'active',
    role: 'admin'
  },
  {
    email: 'senior.officer@cybercrime.gov.in',
    password: 'OfficerPassword123!',
    first_name: 'Senior',
    last_name: 'Officer',
    phone_number: '+919999999997',
    email_verified: true,
    phone_verified: true,
    status: 'active',
    role: 'senior_officer'
  },
  {
    email: 'officer1@cybercrime.gov.in',
    password: 'OfficerPassword123!',
    first_name: 'Investigation',
    last_name: 'Officer',
    phone_number: '+919999999996',
    email_verified: true,
    phone_verified: true,
    status: 'active',
    role: 'officer'
  },
  {
    email: 'officer2@cybercrime.gov.in',
    password: 'OfficerPassword123!',
    first_name: 'Cyber',
    last_name: 'Specialist',
    phone_number: '+919999999995',
    email_verified: true,
    phone_verified: true,
    status: 'active',
    role: 'officer'
  },
  {
    email: 'junior.officer@cybercrime.gov.in',
    password: 'JuniorPassword123!',
    first_name: 'Junior',
    last_name: 'Officer',
    phone_number: '+919999999994',
    email_verified: true,
    phone_verified: true,
    status: 'active',
    role: 'junior_officer'
  },
  {
    email: 'clerk@cybercrime.gov.in',
    password: 'ClerkPassword123!',
    first_name: 'Data',
    last_name: 'Clerk',
    phone_number: '+919999999993',
    email_verified: true,
    phone_verified: true,
    status: 'active',
    role: 'clerk'
  },
  {
    email: 'citizen.test@example.com',
    password: 'CitizenPassword123!',
    first_name: 'Test',
    last_name: 'Citizen',
    phone_number: '+919999999992',
    email_verified: true,
    phone_verified: true,
    status: 'active',
    role: 'citizen',
    address: {
      street: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      country: 'India'
    }
  }
];

const seedUsers = async () => {
  try {
    console.log('👥 Seeding users...');

    for (const userData of users) {
      const { role: roleName, ...userInfo } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: userData.email } });
      
      if (existingUser) {
        console.log(`⏭️  User already exists: ${userData.email}`);
        continue;
      }

      // Create user
      const user = await User.create(userInfo);
      console.log(`✅ Created user: ${user.email}`);

      // Assign role
      const role = await Role.findOne({ where: { name: roleName } });
      if (role) {
        await UserRole.create({
          user_id: user.id,
          role_id: role.id,
          assigned_at: new Date(),
          is_active: true
        });
        console.log(`  🔐 Assigned role: ${role.display_name}`);
      } else {
        console.log(`  ⚠️  Role not found: ${roleName}`);
      }
    }

    console.log('✅ Users seeding completed');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

module.exports = seedUsers;