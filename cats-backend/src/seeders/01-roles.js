const { Role } = require('../models');

const roles = [
  {
    name: 'super_admin',
    display_name: 'Super Administrator',
    description: 'Full system access with all administrative privileges',
    level: 10,
    is_system_role: true,
    metadata: {
      can_manage_system: true,
      can_manage_users: true,
      can_manage_roles: true,
      can_access_all_data: true
    }
  },
  {
    name: 'admin',
    display_name: 'Administrator',
    description: 'Administrative access to manage users, complaints, and applications',
    level: 8,
    is_system_role: true,
    metadata: {
      can_manage_users: true,
      can_manage_complaints: true,
      can_manage_applications: true,
      can_generate_reports: true
    }
  },
  {
    name: 'senior_officer',
    display_name: 'Senior Officer',
    description: 'Senior investigating officer with supervisory privileges',
    level: 6,
    is_system_role: true,
    metadata: {
      can_supervise_cases: true,
      can_assign_officers: true,
      can_escalate_cases: true,
      can_approve_actions: true
    }
  },
  {
    name: 'officer',
    display_name: 'Officer',
    description: 'Investigating officer who handles complaints and applications',
    level: 4,
    is_system_role: true,
    metadata: {
      can_investigate_cases: true,
      can_update_status: true,
      can_communicate_with_complainants: true,
      can_upload_evidence: true
    }
  },
  {
    name: 'junior_officer',
    display_name: 'Junior Officer',
    description: 'Junior officer with limited investigation privileges',
    level: 3,
    is_system_role: true,
    metadata: {
      can_assist_investigations: true,
      can_update_basic_status: true,
      can_communicate_with_complainants: true
    }
  },
  {
    name: 'clerk',
    display_name: 'Clerk',
    description: 'Administrative clerk for data entry and basic operations',
    level: 2,
    is_system_role: true,
    metadata: {
      can_enter_data: true,
      can_generate_basic_reports: true,
      can_manage_documents: true
    }
  },
  {
    name: 'citizen',
    display_name: 'Citizen',
    description: 'Regular citizen who can file complaints and applications',
    level: 1,
    is_system_role: true,
    metadata: {
      can_file_complaints: true,
      can_file_applications: true,
      can_track_status: true,
      can_communicate_with_officers: true
    }
  }
];

const seedRoles = async () => {
  try {
    console.log('📝 Seeding roles...');

    for (const roleData of roles) {
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData
      });

      if (created) {
        console.log(`✅ Created role: ${role.display_name}`);
      } else {
        console.log(`⏭️  Role already exists: ${role.display_name}`);
      }
    }

    console.log('✅ Roles seeding completed');
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    throw error;
  }
};

module.exports = seedRoles;