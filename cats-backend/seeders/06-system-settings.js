const { SystemSetting } = require('../models');

const systemSettings = [
  // System Configuration
  {
    key: 'system_name',
    value: 'Complaint and Application Tracking System (CATS)',
    data_type: 'string',
    category: 'system',
    description: 'Name of the system displayed in UI',
    is_user_configurable: true,
    access_level: 'admin'
  },
  {
    key: 'system_version',
    value: '1.0.0',
    data_type: 'string',
    category: 'system',
    description: 'Current system version',
    is_user_configurable: false,
    access_level: 'public'
  },
  {
    key: 'maintenance_mode',
    value: false,
    data_type: 'boolean',
    category: 'system',
    description: 'Enable/disable maintenance mode',
    is_user_configurable: true,
    access_level: 'super_admin',
    requires_restart: true
  },
  {
    key: 'max_file_upload_size',
    value: 10485760,
    data_type: 'number',
    category: 'system',
    description: 'Maximum file upload size in bytes (10MB)',
    validation_rules: {
      min: 1048576,
      max: 104857600
    },
    is_user_configurable: true,
    access_level: 'admin'
  },

  // Security Settings
  {
    key: 'password_min_length',
    value: 8,
    data_type: 'number',
    category: 'security',
    description: 'Minimum password length requirement',
    validation_rules: {
      min: 6,
      max: 20
    },
    is_user_configurable: true,
    access_level: 'admin'
  },
  {
    key: 'password_require_special_chars',
    value: true,
    data_type: 'boolean',
    category: 'security',
    description: 'Require special characters in passwords',
    is_user_configurable: true,
    access_level: 'admin'
  },
  {
    key: 'session_timeout_minutes',
    value: 30,
    data_type: 'number',
    category: 'security',
    description: 'Session timeout in minutes',
    validation_rules: {
      min: 5,
      max: 480
    },
    is_user_configurable: true,
    access_level: 'admin'
  },
  {
    key: 'max_login_attempts',
    value: 5,
    data_type: 'number',
    category: 'security',
    description: 'Maximum failed login attempts before account lock',
    validation_rules: {
      min: 3,
      max: 10
    },
    is_user_configurable: true,
    access_level: 'admin'
  },
  {
    key: 'account_lockout_duration_minutes',
    value: 30,
    data_type: 'number',
    category: 'security',
    description: 'Account lockout duration in minutes',
    validation_rules: {
      min: 5,
      max: 1440
    },
    is_user_configurable: true,
    access_level: 'admin'
  },

  // SLA Settings
  {
    key: 'default_sla_hours_high',
    value: 24,
    data_type: 'number',
    category: 'sla',
    description: 'Default SLA hours for high priority complaints',
    validation_rules: {
      min: 1,
      max: 168
    },
    is_user_configurable: true,
    access_level: 'admin'
  },
  {
    key: 'default_sla_hours_medium',
    value: 72,
    data_type: 'number',
    category: 'sla',
    description: 'Default SLA hours for medium priority complaints',
    validation_rules: {
      min: 1,
      max: 168
    },
    is_user_configurable: true,
    access_level: 'admin'
  },
  {
    key: 'default_sla_hours_low',
    value: 168,
    data_type: 'number',
    category: 'sla',
    description: 'Default SLA hours for low priority complaints',
    validation_rules: {
      min: 1,
      max: 720
    },
    is_user_configurable: true,
    access_level: 'admin'
  },
  {
    key: 'sla_warning_threshold_percent',
    value: 75,
    data_type: 'number',
    category: 'sla',
    description: 'SLA warning threshold percentage',
    validation_rules: {
      min: 50,
      max: 95
    },
    is_user_configurable: true,
    access_level: 'admin'
  },

  // Notification Settings
  {
    key: 'email_notifications_enabled',
    value: true,
    data_type: 'boolean',
    category: 'notification',
    description: 'Enable email notifications',
    is_user_configurable: true,
    access_level: 'admin'
  },
  {
    key: 'sms_notifications_enabled',
    value: true,
    data_type: 'boolean',
    category: 'notification',
    description: 'Enable SMS notifications',
    is_user_configurable: true,
    access_level: 'admin'
  },
  {
    key: 'notification_retry_attempts',
    value: 3,
    data_type: 'number',
    category: 'notification',
    description: 'Number of retry attempts for failed notifications',
    validation_rules: {
      min: 1,
      max: 5
    },
    is_user_configurable: true,
    access_level: 'admin'
  },
  {
    key: 'notification_batch_size',
    value: 100,
    data_type: 'number',
    category: 'notification',
    description: 'Batch size for bulk notifications',
    validation_rules: {
      min: 10,
      max: 1000
    },
    is_user_configurable: true,
    access_level: 'admin'
  },

  // Workflow Settings
  {
    key: 'auto_assignment_enabled',
    value: true,
    data_type: 'boolean',
    category: 'workflow',
    description: 'Enable automatic complaint assignment',
    is_user_configurable: true,
    access_level: 'admin'
  },
  {
    key: 'auto_escalation_enabled',
    value: true,
    data_type: 'boolean',
    category: 'workflow',
    description: 'Enable automatic escalation for overdue complaints',
    is_user_configurable: true,
    access_level: 'admin'
  },
  {
    key: 'escalation_check_interval_hours',
    value: 6,
    data_type: 'number',
    category: 'workflow',
    description: 'Interval for checking escalation conditions (hours)',
    validation_rules: {
      min: 1,
      max: 24
    },
    is_user_configurable: true,
    access_level: 'admin'
  },
  {
    key: 'allow_anonymous_complaints',
    value: true,
    data_type: 'boolean',
    category: 'workflow',
    description: 'Allow anonymous complaint submissions',
    is_user_configurable: true,
    access_level: 'admin'
  },

  // UI Settings
  {
    key: 'items_per_page',
    value: 20,
    data_type: 'number',
    category: 'ui',
    description: 'Default number of items per page in lists',
    validation_rules: {
      min: 10,
      max: 100
    },
    is_user_configurable: true,
    access_level: 'user'
  },
  {
    key: 'default_language',
    value: 'en',
    data_type: 'string',
    category: 'ui',
    description: 'Default system language',
    validation_rules: {
      enum: ['en', 'hi', 'ta', 'te', 'bn']
    },
    is_user_configurable: true,
    access_level: 'admin'
  },
  {
    key: 'theme_mode',
    value: 'light',
    data_type: 'string',
    category: 'ui',
    description: 'Default theme mode',
    validation_rules: {
      enum: ['light', 'dark', 'auto']
    },
    is_user_configurable: true,
    access_level: 'user'
  },

  // Reporting Settings
  {
    key: 'report_retention_days',
    value: 365,
    data_type: 'number',
    category: 'reporting',
    description: 'Number of days to retain generated reports',
    validation_rules: {
      min: 30,
      max: 2555
    },
    is_user_configurable: true,
    access_level: 'admin'
  },
  {
    key: 'max_export_records',
    value: 10000,
    data_type: 'number',
    category: 'reporting',
    description: 'Maximum number of records allowed in data export',
    validation_rules: {
      min: 100,
      max: 100000
    },
    is_user_configurable: true,
    access_level: 'admin'
  },

  // Backup Settings
  {
    key: 'auto_backup_enabled',
    value: true,
    data_type: 'boolean',
    category: 'backup',
    description: 'Enable automatic database backups',
    is_user_configurable: true,
    access_level: 'super_admin'
  },
  {
    key: 'backup_frequency_hours',
    value: 24,
    data_type: 'number',
    category: 'backup',
    description: 'Backup frequency in hours',
    validation_rules: {
      min: 1,
      max: 168
    },
    is_user_configurable: true,
    access_level: 'super_admin'
  },
  {
    key: 'backup_retention_days',
    value: 30,
    data_type: 'number',
    category: 'backup',
    description: 'Number of days to retain backups',
    validation_rules: {
      min: 7,
      max: 365
    },
    is_user_configurable: true,
    access_level: 'super_admin'
  },

  // Compliance Settings
  {
    key: 'audit_log_retention_days',
    value: 2555,
    data_type: 'number',
    category: 'compliance',
    description: 'Number of days to retain audit logs (7 years)',
    validation_rules: {
      min: 365,
      max: 3650
    },
    is_user_configurable: true,
    access_level: 'super_admin'
  },
  {
    key: 'data_retention_policy_days',
    value: 2555,
    data_type: 'number',
    category: 'compliance',
    description: 'Default data retention period in days',
    validation_rules: {
      min: 365,
      max: 3650
    },
    is_user_configurable: true,
    access_level: 'super_admin'
  },
  {
    key: 'gdpr_compliance_enabled',
    value: true,
    data_type: 'boolean',
    category: 'compliance',
    description: 'Enable GDPR compliance features',
    is_user_configurable: true,
    access_level: 'super_admin'
  }
];

const seedSystemSettings = async () => {
  try {
    console.log('⚙️  Seeding system settings...');

    for (const settingData of systemSettings) {
      const [setting, created] = await SystemSetting.findOrCreate({
        where: { key: settingData.key },
        defaults: {
          ...settingData,
          default_value: settingData.value
        }
      });

      if (created) {
        console.log(`✅ Created setting: ${setting.key}`);
      } else {
        console.log(`⏭️  Setting already exists: ${setting.key}`);
      }
    }

    console.log('✅ System settings seeding completed');
  } catch (error) {
    console.error('❌ Error seeding system settings:', error);
    throw error;
  }
};

module.exports = seedSystemSettings;