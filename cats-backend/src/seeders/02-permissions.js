const { Permission } = require('../models');

const permissions = [
  // System Management
  {
    name: 'manage_system',
    display_name: 'Manage System',
    description: 'Full system management access',
    resource: 'system',
    action: 'manage',
    scope: 'all',
    is_system_permission: true
  },
  {
    name: 'manage_settings',
    display_name: 'Manage Settings',
    description: 'Manage system settings and configuration',
    resource: 'settings',
    action: 'manage',
    scope: 'all',
    is_system_permission: true
  },

  // User Management
  {
    name: 'create_users',
    display_name: 'Create Users',
    description: 'Create new user accounts',
    resource: 'user',
    action: 'create',
    scope: 'all'
  },
  {
    name: 'read_users',
    display_name: 'Read Users',
    description: 'View user information',
    resource: 'user',
    action: 'read',
    scope: 'all'
  },
  {
    name: 'update_users',
    display_name: 'Update Users',
    description: 'Update user information',
    resource: 'user',
    action: 'update',
    scope: 'all'
  },
  {
    name: 'delete_users',
    display_name: 'Delete Users',
    description: 'Delete user accounts',
    resource: 'user',
    action: 'delete',
    scope: 'all'
  },
  {
    name: 'manage_user_roles',
    display_name: 'Manage User Roles',
    description: 'Assign and manage user roles',
    resource: 'user',
    action: 'manage',
    scope: 'all'
  },

  // Role and Permission Management
  {
    name: 'manage_roles',
    display_name: 'Manage Roles',
    description: 'Create, update, and delete roles',
    resource: 'role',
    action: 'manage',
    scope: 'all',
    is_system_permission: true
  },
  {
    name: 'manage_permissions',
    display_name: 'Manage Permissions',
    description: 'Create, update, and delete permissions',
    resource: 'permission',
    action: 'manage',
    scope: 'all',
    is_system_permission: true
  },

  // Complaint Management
  {
    name: 'create_complaints',
    display_name: 'Create Complaints',
    description: 'Submit new complaints',
    resource: 'complaint',
    action: 'create',
    scope: 'own'
  },
  {
    name: 'read_own_complaints',
    display_name: 'Read Own Complaints',
    description: 'View own complaints',
    resource: 'complaint',
    action: 'read',
    scope: 'own'
  },
  {
    name: 'read_all_complaints',
    display_name: 'Read All Complaints',
    description: 'View all complaints',
    resource: 'complaint',
    action: 'read',
    scope: 'all'
  },
  {
    name: 'update_complaints',
    display_name: 'Update Complaints',
    description: 'Update complaint information',
    resource: 'complaint',
    action: 'update',
    scope: 'all'
  },
  {
    name: 'delete_complaints',
    display_name: 'Delete Complaints',
    description: 'Delete complaints',
    resource: 'complaint',
    action: 'delete',
    scope: 'all'
  },
  {
    name: 'manage_complaint_status',
    display_name: 'Manage Complaint Status',
    description: 'Update complaint status and workflow',
    resource: 'complaint',
    action: 'manage',
    scope: 'all'
  },
  {
    name: 'assign_complaints',
    display_name: 'Assign Complaints',
    description: 'Assign complaints to officers',
    resource: 'complaint',
    action: 'execute',
    scope: 'all'
  },

  // Application Management
  {
    name: 'create_applications',
    display_name: 'Create Applications',
    description: 'Submit new applications',
    resource: 'application',
    action: 'create',
    scope: 'own'
  },
  {
    name: 'read_own_applications',
    display_name: 'Read Own Applications',
    description: 'View own applications',
    resource: 'application',
    action: 'read',
    scope: 'own'
  },
  {
    name: 'read_all_applications',
    display_name: 'Read All Applications',
    description: 'View all applications',
    resource: 'application',
    action: 'read',
    scope: 'all'
  },
  {
    name: 'update_applications',
    display_name: 'Update Applications',
    description: 'Update application information',
    resource: 'application',
    action: 'update',
    scope: 'all'
  },
  {
    name: 'approve_applications',
    display_name: 'Approve Applications',
    description: 'Approve or reject applications',
    resource: 'application',
    action: 'execute',
    scope: 'all'
  },
  {
    name: 'issue_certificates',
    display_name: 'Issue Certificates',
    description: 'Issue certificates for approved applications',
    resource: 'application',
    action: 'execute',
    scope: 'all'
  },

  // Evidence Management
  {
    name: 'upload_evidence',
    display_name: 'Upload Evidence',
    description: 'Upload evidence files',
    resource: 'evidence',
    action: 'create',
    scope: 'own'
  },
  {
    name: 'view_evidence',
    display_name: 'View Evidence',
    description: 'View evidence files',
    resource: 'evidence',
    action: 'read',
    scope: 'all'
  },
  {
    name: 'manage_evidence',
    display_name: 'Manage Evidence',
    description: 'Full evidence management access',
    resource: 'evidence',
    action: 'manage',
    scope: 'all'
  },
  {
    name: 'delete_evidence',
    display_name: 'Delete Evidence',
    description: 'Delete evidence files',
    resource: 'evidence',
    action: 'delete',
    scope: 'all'
  },

  // Communication
  {
    name: 'send_messages',
    display_name: 'Send Messages',
    description: 'Send messages and communications',
    resource: 'message',
    action: 'create',
    scope: 'own'
  },
  {
    name: 'read_messages',
    display_name: 'Read Messages',
    description: 'Read messages and communications',
    resource: 'message',
    action: 'read',
    scope: 'own'
  },
  {
    name: 'manage_communications',
    display_name: 'Manage Communications',
    description: 'Full communication management access',
    resource: 'message',
    action: 'manage',
    scope: 'all'
  },

  // Reporting and Analytics
  {
    name: 'generate_reports',
    display_name: 'Generate Reports',
    description: 'Generate system reports',
    resource: 'report',
    action: 'create',
    scope: 'all'
  },
  {
    name: 'view_analytics',
    display_name: 'View Analytics',
    description: 'View system analytics and statistics',
    resource: 'analytics',
    action: 'read',
    scope: 'all'
  },
  {
    name: 'export_data',
    display_name: 'Export Data',
    description: 'Export system data',
    resource: 'data',
    action: 'execute',
    scope: 'all'
  },

  // Audit and Compliance
  {
    name: 'view_audit_logs',
    display_name: 'View Audit Logs',
    description: 'View system audit logs',
    resource: 'audit_log',
    action: 'read',
    scope: 'all'
  },
  {
    name: 'manage_compliance',
    display_name: 'Manage Compliance',
    description: 'Manage compliance and regulatory requirements',
    resource: 'compliance',
    action: 'manage',
    scope: 'all'
  },

  // Notification Management
  {
    name: 'send_notifications',
    display_name: 'Send Notifications',
    description: 'Send system notifications',
    resource: 'notification',
    action: 'create',
    scope: 'all'
  },
  {
    name: 'manage_notifications',
    display_name: 'Manage Notifications',
    description: 'Manage notification settings and templates',
    resource: 'notification',
    action: 'manage',
    scope: 'all'
  }
];

const seedPermissions = async () => {
  try {
    console.log('🔐 Seeding permissions...');

    for (const permissionData of permissions) {
      const [permission, created] = await Permission.findOrCreate({
        where: { name: permissionData.name },
        defaults: permissionData
      });

      if (created) {
        console.log(`✅ Created permission: ${permission.display_name}`);
      } else {
        console.log(`⏭️  Permission already exists: ${permission.display_name}`);
      }
    }

    console.log('✅ Permissions seeding completed');
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    throw error;
  }
};

module.exports = seedPermissions;