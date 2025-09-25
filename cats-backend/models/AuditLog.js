module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.ENUM(
        'create',
        'read',
        'update',
        'delete',
        'login',
        'logout',
        'password_change',
        'password_reset',
        'email_verification',
        'phone_verification',
        'role_assignment',
        'permission_grant',
        'permission_revoke',
        'file_upload',
        'file_download',
        'file_delete',
        'export_data',
        'import_data',
        'system_config',
        'backup_create',
        'backup_restore',
        'security_event',
        'compliance_check',
        'data_access',
        'data_modification',
        'escalation',
        'assignment',
        'status_change',
        'approval',
        'rejection',
        'notification_sent',
        'report_generated',
        'api_access',
        'bulk_operation',
        'other'
      ),
      allowNull: false
    },
    resource_type: {
      type: DataTypes.ENUM(
        'user',
        'complaint',
        'application',
        'evidence',
        'message',
        'role',
        'permission',
        'system_setting',
        'notification',
        'report',
        'audit_log',
        'session',
        'api_key',
        'backup',
        'configuration',
        'other'
      ),
      allowNull: false
    },
    resource_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    resource_identifier: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 1000]
      }
    },
    old_values: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    new_values: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    changes: {
      type: DataTypes.JSONB,
      allowNull: true,
      validate: {
        isValidChanges(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Changes must be an object');
          }
        }
      }
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    category: {
      type: DataTypes.ENUM(
        'authentication',
        'authorization',
        'data_access',
        'data_modification',
        'system_administration',
        'security',
        'compliance',
        'user_activity',
        'system_activity',
        'error',
        'warning',
        'information',
        'other'
      ),
      defaultValue: 'user_activity'
    },
    status: {
      type: DataTypes.ENUM('success', 'failure', 'warning', 'error'),
      defaultValue: 'success'
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    session_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    request_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    source: {
      type: DataTypes.ENUM('web', 'mobile', 'api', 'system', 'cli', 'other'),
      defaultValue: 'web'
    },
    endpoint: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 255]
      }
    },
    method: {
      type: DataTypes.ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'),
      allowNull: true
    },
    response_code: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 100,
        max: 599
      }
    },
    response_time: {
      type: DataTypes.INTEGER, // milliseconds
      allowNull: true,
      validate: {
        min: 0
      }
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    stack_trace: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tags: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Tags must be an array');
          }
        }
      }
    },
    context: {
      type: DataTypes.JSONB,
      defaultValue: {},
      validate: {
        isValidContext(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Context must be an object');
          }
        }
      }
    },
    compliance_flags: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Compliance flags must be an array');
          }
        }
      }
    },
    retention_period: {
      type: DataTypes.INTEGER, // Days
      allowNull: true,
      validate: {
        min: 1
      }
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_sensitive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    archived_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      validate: {
        isValidMetadata(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Metadata must be an object');
          }
        }
      }
    }
  }, {
    tableName: 'audit_logs',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['action']
      },
      {
        fields: ['resource_type']
      },
      {
        fields: ['resource_id']
      },
      {
        fields: ['resource_identifier']
      },
      {
        fields: ['severity']
      },
      {
        fields: ['category']
      },
      {
        fields: ['status']
      },
      {
        fields: ['ip_address']
      },
      {
        fields: ['session_id']
      },
      {
        fields: ['request_id']
      },
      {
        fields: ['source']
      },
      {
        fields: ['endpoint']
      },
      {
        fields: ['method']
      },
      {
        fields: ['response_code']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['expires_at']
      },
      {
        fields: ['is_sensitive']
      },
      {
        fields: ['is_archived']
      }
    ],
    hooks: {
      beforeCreate: async (auditLog) => {
        // Set expiration date if retention period is specified
        if (auditLog.retention_period && !auditLog.expires_at) {
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + auditLog.retention_period);
          auditLog.expires_at = expirationDate;
        }

        // Add compliance flags based on action and resource type
        const complianceFlags = [...auditLog.compliance_flags];
        
        if (auditLog.action === 'data_access' && auditLog.is_sensitive) {
          complianceFlags.push('sensitive_data_access');
        }
        
        if (auditLog.action === 'data_modification' && auditLog.resource_type === 'complaint') {
          complianceFlags.push('complaint_modification');
        }
        
        if (auditLog.action === 'export_data') {
          complianceFlags.push('data_export');
        }
        
        auditLog.compliance_flags = complianceFlags;
      }
    }
  });

  // Instance methods
  AuditLog.prototype.isExpired = function() {
    return this.expires_at && new Date() > this.expires_at;
  };

  AuditLog.prototype.archive = async function() {
    return this.update({
      is_archived: true,
      archived_at: new Date()
    });
  };

  AuditLog.prototype.addTag = async function(tag) {
    if (!this.tags.includes(tag)) {
      const tags = [...this.tags, tag];
      return this.update({ tags });
    }
    return this;
  };

  AuditLog.prototype.removeTag = async function(tag) {
    const tags = this.tags.filter(t => t !== tag);
    return this.update({ tags });
  };

  AuditLog.prototype.addComplianceFlag = async function(flag) {
    if (!this.compliance_flags.includes(flag)) {
      const flags = [...this.compliance_flags, flag];
      return this.update({ compliance_flags: flags });
    }
    return this;
  };

  AuditLog.prototype.toSafeJSON = function() {
    const auditLog = this.toJSON();
    
    // Remove sensitive information based on access level
    if (this.is_sensitive) {
      delete auditLog.old_values;
      delete auditLog.new_values;
      delete auditLog.stack_trace;
    }
    
    // Remove internal metadata
    if (auditLog.metadata && auditLog.metadata.internal) {
      delete auditLog.metadata.internal;
    }
    
    return auditLog;
  };

  // Class methods
  AuditLog.findByUser = function(userId, limit = 100) {
    return this.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit
    });
  };

  AuditLog.findByResource = function(resourceType, resourceId) {
    return this.findAll({
      where: {
        resource_type: resourceType,
        resource_id: resourceId
      },
      order: [['created_at', 'DESC']]
    });
  };

  AuditLog.findByAction = function(action, limit = 100) {
    return this.findAll({
      where: { action },
      order: [['created_at', 'DESC']],
      limit
    });
  };

  AuditLog.findByCategory = function(category, limit = 100) {
    return this.findAll({
      where: { category },
      order: [['created_at', 'DESC']],
      limit
    });
  };

  AuditLog.findBySeverity = function(severity, limit = 100) {
    return this.findAll({
      where: { severity },
      order: [['created_at', 'DESC']],
      limit
    });
  };

  AuditLog.findByDateRange = function(startDate, endDate, limit = 1000) {
    return this.findAll({
      where: {
        created_at: {
          [sequelize.Op.between]: [startDate, endDate]
        }
      },
      order: [['created_at', 'DESC']],
      limit
    });
  };

  AuditLog.findSecurityEvents = function(limit = 100) {
    return this.findAll({
      where: {
        category: 'security',
        severity: {
          [sequelize.Op.in]: ['high', 'critical']
        }
      },
      order: [['created_at', 'DESC']],
      limit
    });
  };

  AuditLog.findFailedActions = function(limit = 100) {
    return this.findAll({
      where: {
        status: {
          [sequelize.Op.in]: ['failure', 'error']
        }
      },
      order: [['created_at', 'DESC']],
      limit
    });
  };

  AuditLog.findExpiredLogs = function() {
    return this.findAll({
      where: {
        expires_at: {
          [sequelize.Op.lt]: new Date()
        },
        is_archived: false
      },
      order: [['expires_at', 'ASC']]
    });
  };

  AuditLog.getStatistics = async function(filters = {}) {
    const whereClause = { ...filters };
    
    const stats = await this.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'success' THEN 1 END")), 'successful'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'failure' THEN 1 END")), 'failed'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN severity = 'critical' THEN 1 END")), 'critical'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN category = 'security' THEN 1 END")), 'security_events'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN is_sensitive = true THEN 1 END")), 'sensitive_operations']
      ],
      raw: true
    });

    return {
      total: parseInt(stats[0].total) || 0,
      successful: parseInt(stats[0].successful) || 0,
      failed: parseInt(stats[0].failed) || 0,
      critical: parseInt(stats[0].critical) || 0,
      security_events: parseInt(stats[0].security_events) || 0,
      sensitive_operations: parseInt(stats[0].sensitive_operations) || 0
    };
  };

  // Static method to log an action
  AuditLog.logAction = async function(data) {
    const logEntry = await this.create({
      ...data,
      ip_address: data.req?.ip,
      user_agent: data.req?.get('User-Agent'),
      session_id: data.req?.sessionID,
      request_id: data.req?.id,
      endpoint: data.req?.originalUrl,
      method: data.req?.method
    });

    // Trigger alerts for critical security events
    if (logEntry.severity === 'critical' && logEntry.category === 'security') {
      // Queue security alert notification
      // This would integrate with your alerting service
    }

    return logEntry;
  };

  // Associations
  AuditLog.associate = function(models) {
    AuditLog.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return AuditLog;
};