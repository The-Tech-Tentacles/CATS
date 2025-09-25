const { Role, Permission, RolePermission } = require('../models');

const rolePermissionMappings = {
  super_admin: [
    // All permissions for super admin
    'manage_system',
    'manage_settings',
    'create_users',
    'read_users',
    'update_users',
    'delete_users',
    'manage_user_roles',
    'manage_roles',
    'manage_permissions',
    'read_all_complaints',
    'update_complaints',
    'delete_complaints',
    'manage_complaint_status',
    'assign_complaints',
    'read_all_applications',
    'update_applications',
    'approve_applications',
    'issue_certificates',
    'manage_evidence',
    'delete_evidence',
    'manage_communications',
    'generate_reports',
    'view_analytics',
    'export_data',
    'view_audit_logs',
    'manage_compliance',
    'manage_notifications'
  ],
  
  admin: [
    'create_users',
    'read_users',
    'update_users',
    'manage_user_roles',
    'read_all_complaints',
    'update_complaints',
    'manage_complaint_status',
    'assign_complaints',
    'read_all_applications',
    'update_applications',
    'approve_applications',
    'issue_certificates',
    'manage_evidence',
    'manage_communications',
    'generate_reports',
    'view_analytics',
    'export_data',
    'view_audit_logs',
    'send_notifications'
  ],
  
  senior_officer: [
    'read_users',
    'read_all_complaints',
    'update_complaints',
    'manage_complaint_status',
    'assign_complaints',
    'read_all_applications',
    'update_applications',
    'approve_applications',
    'view_evidence',
    'manage_evidence',
    'manage_communications',
    'generate_reports',
    'view_analytics',
    'send_notifications'
  ],
  
  officer: [
    'read_users',
    'read_all_complaints',
    'update_complaints',
    'manage_complaint_status',
    'read_all_applications',
    'update_applications',
    'upload_evidence',
    'view_evidence',
    'send_messages',
    'read_messages',
    'generate_reports',
    'view_analytics'
  ],
  
  junior_officer: [
    'read_all_complaints',
    'update_complaints',
    'read_all_applications',
    'upload_evidence',
    'view_evidence',
    'send_messages',
    'read_messages'
  ],
  
  clerk: [
    'read_all_complaints',
    'read_all_applications',
    'upload_evidence',
    'view_evidence',
    'send_messages',
    'read_messages',
    'generate_reports'
  ],
  
  citizen: [
    'create_complaints',
    'read_own_complaints',
    'create_applications',
    'read_own_applications',
    'upload_evidence',
    'send_messages',
    'read_messages'
  ]
};

const seedRolePermissions = async () => {
  try {
    console.log('🔗 Seeding role-permission mappings...');

    for (const [roleName, permissionNames] of Object.entries(rolePermissionMappings)) {
      const role = await Role.findOne({ where: { name: roleName } });
      
      if (!role) {
        console.log(`⚠️  Role not found: ${roleName}`);
        continue;
      }

      console.log(`📋 Processing role: ${role.display_name}`);

      for (const permissionName of permissionNames) {
        const permission = await Permission.findOne({ where: { name: permissionName } });
        
        if (!permission) {
          console.log(`⚠️  Permission not found: ${permissionName}`);
          continue;
        }

        const [rolePermission, created] = await RolePermission.findOrCreate({
          where: {
            role_id: role.id,
            permission_id: permission.id
          },
          defaults: {
            role_id: role.id,
            permission_id: permission.id,
            granted_at: new Date()
          }
        });

        if (created) {
          console.log(`  ✅ Granted permission: ${permission.display_name}`);
        } else {
          console.log(`  ⏭️  Permission already granted: ${permission.display_name}`);
        }
      }
    }

    console.log('✅ Role-permission mappings seeding completed');
  } catch (error) {
    console.error('❌ Error seeding role-permission mappings:', error);
    throw error;
  }
};

module.exports = seedRolePermissions;