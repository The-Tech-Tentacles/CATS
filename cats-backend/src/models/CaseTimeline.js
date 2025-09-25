module.exports = (sequelize, DataTypes) => {
  const CaseTimeline = sequelize.define('CaseTimeline', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    complaint_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'complaints',
        key: 'id'
      }
    },
    application_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'applications',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.ENUM(
        'created',
        'submitted',
        'acknowledged',
        'assigned',
        'status_changed',
        'priority_changed',
        'evidence_added',
        'message_sent',
        'note_added',
        'escalated',
        'resolved',
        'closed',
        'reopened',
        'approved',
        'rejected',
        'cancelled',
        'updated',
        'comment_added',
        'document_uploaded',
        'payment_received',
        'certificate_issued',
        'reminder_sent',
        'deadline_extended',
        'transferred',
        'merged',
        'split',
        'archived',
        'other'
      ),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previous_value: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    new_value: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    field_changed: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 100]
      }
    },
    visibility: {
      type: DataTypes.ENUM('public', 'internal', 'system'),
      defaultValue: 'public'
    },
    is_automated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_milestone: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    milestone_type: {
      type: DataTypes.ENUM(
        'submission',
        'acknowledgment',
        'assignment',
        'investigation_start',
        'first_response',
        'resolution',
        'closure',
        'approval',
        'rejection',
        'certificate_issue',
        'payment',
        'escalation',
        'sla_breach',
        'other'
      ),
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    category: {
      type: DataTypes.ENUM(
        'status_update',
        'assignment',
        'communication',
        'evidence',
        'payment',
        'approval',
        'system',
        'user_action',
        'escalation',
        'notification',
        'other'
      ),
      defaultValue: 'status_update'
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
    related_entities: {
      type: DataTypes.JSONB,
      defaultValue: {},
      validate: {
        isValidEntities(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Related entities must be an object');
          }
        }
      }
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Attachments must be an array');
          }
        }
      }
    },
    duration: {
      type: DataTypes.INTEGER, // Duration in minutes
      allowNull: true,
      validate: {
        min: 0
      }
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: true,
      validate: {
        isValidLocation(value) {
          if (value && typeof value === 'object') {
            if (!value.type || !value.coordinates) {
              throw new Error('Location must have type and coordinates');
            }
          }
        }
      }
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
    source: {
      type: DataTypes.ENUM('web', 'mobile', 'api', 'system', 'email', 'sms', 'phone', 'other'),
      defaultValue: 'web'
    },
    notification_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    notification_sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_sensitive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    access_level: {
      type: DataTypes.ENUM('public', 'restricted', 'confidential'),
      defaultValue: 'public'
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
    tableName: 'case_timeline',
    indexes: [
      {
        fields: ['complaint_id']
      },
      {
        fields: ['application_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['action']
      },
      {
        fields: ['visibility']
      },
      {
        fields: ['is_milestone']
      },
      {
        fields: ['milestone_type']
      },
      {
        fields: ['category']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['is_automated']
      },
      {
        fields: ['is_sensitive']
      },
      {
        fields: ['access_level']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['notification_sent']
      }
    ]
  });

  // Instance methods
  CaseTimeline.prototype.canBeViewedBy = function(user) {
    // Check visibility level
    if (this.visibility === 'system') {
      return user.hasRole(['admin', 'super_admin']);
    }
    
    if (this.visibility === 'internal') {
      return user.hasRole(['officer', 'admin', 'super_admin']);
    }
    
    // Public visibility - check access level
    switch (this.access_level) {
      case 'public':
        return true;
      case 'restricted':
        // User must be related to the case or have officer role
        return this.isRelatedUser(user) || user.hasRole(['officer', 'admin', 'super_admin']);
      case 'confidential':
        // Only officers and above
        return user.hasRole(['officer', 'admin', 'super_admin']);
      default:
        return false;
    }
  };

  CaseTimeline.prototype.isRelatedUser = function(user) {
    // Check if user is the complainant/applicant or involved in the case
    if (this.complaint_id) {
      // Would need to check if user is the complainant
      return false; // Placeholder - implement based on complaint relationship
    }
    
    if (this.application_id) {
      // Would need to check if user is the applicant
      return false; // Placeholder - implement based on application relationship
    }
    
    return false;
  };

  CaseTimeline.prototype.markNotificationSent = async function() {
    return this.update({
      notification_sent: true,
      notification_sent_at: new Date()
    });
  };

  CaseTimeline.prototype.addTag = async function(tag) {
    if (!this.tags.includes(tag)) {
      const tags = [...this.tags, tag];
      return this.update({ tags });
    }
    return this;
  };

  CaseTimeline.prototype.removeTag = async function(tag) {
    const tags = this.tags.filter(t => t !== tag);
    return this.update({ tags });
  };

  CaseTimeline.prototype.addAttachment = async function(attachment) {
    const attachments = [...this.attachments, attachment];
    return this.update({ attachments });
  };

  CaseTimeline.prototype.toSafeJSON = function() {
    const timeline = this.toJSON();
    
    // Remove sensitive information
    delete timeline.ip_address;
    delete timeline.user_agent;
    delete timeline.session_id;
    
    // Remove internal metadata
    if (timeline.metadata && timeline.metadata.internal) {
      delete timeline.metadata.internal;
    }
    
    return timeline;
  };

  // Class methods
  CaseTimeline.findByComplaint = function(complaintId, visibility = ['public']) {
    return this.findAll({
      where: {
        complaint_id: complaintId,
        visibility: {
          [sequelize.Op.in]: visibility
        }
      },
      order: [['created_at', 'ASC']]
    });
  };

  CaseTimeline.findByApplication = function(applicationId, visibility = ['public']) {
    return this.findAll({
      where: {
        application_id: applicationId,
        visibility: {
          [sequelize.Op.in]: visibility
        }
      },
      order: [['created_at', 'ASC']]
    });
  };

  CaseTimeline.getMilestones = function(caseId, caseType = 'complaint') {
    const whereClause = {
      is_milestone: true
    };
    
    if (caseType === 'complaint') {
      whereClause.complaint_id = caseId;
    } else {
      whereClause.application_id = caseId;
    }
    
    return this.findAll({
      where: whereClause,
      order: [['created_at', 'ASC']]
    });
  };

  CaseTimeline.getByAction = function(action) {
    return this.findAll({
      where: { action },
      order: [['created_at', 'DESC']]
    });
  };

  CaseTimeline.getByUser = function(userId) {
    return this.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });
  };

  CaseTimeline.getPendingNotifications = function() {
    return this.findAll({
      where: {
        notification_sent: false,
        visibility: {
          [sequelize.Op.in]: ['public', 'internal']
        }
      },
      order: [['created_at', 'ASC']]
    });
  };

  CaseTimeline.getRecentActivity = function(limit = 50) {
    return this.findAll({
      where: {
        visibility: 'public'
      },
      order: [['created_at', 'DESC']],
      limit
    });
  };

  CaseTimeline.getStatistics = async function(filters = {}) {
    const whereClause = { ...filters };
    
    const stats = await this.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN is_milestone = true THEN 1 END")), 'milestones'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN is_automated = true THEN 1 END")), 'automated'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN visibility = 'public' THEN 1 END")), 'public_entries'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN notification_sent = false THEN 1 END")), 'pending_notifications']
      ],
      raw: true
    });

    return {
      total: parseInt(stats[0].total) || 0,
      milestones: parseInt(stats[0].milestones) || 0,
      automated: parseInt(stats[0].automated) || 0,
      public_entries: parseInt(stats[0].public_entries) || 0,
      pending_notifications: parseInt(stats[0].pending_notifications) || 0
    };
  };

  // Static method to create timeline entry
  CaseTimeline.createEntry = async function(data) {
    const entry = await this.create({
      ...data,
      ip_address: data.req?.ip,
      user_agent: data.req?.get('User-Agent'),
      session_id: data.req?.sessionID
    });

    // Trigger notification if needed
    if (entry.visibility === 'public' && !entry.is_automated) {
      // Queue notification job
      // This would integrate with your notification service
    }

    return entry;
  };

  // Associations
  CaseTimeline.associate = function(models) {
    CaseTimeline.belongsTo(models.Complaint, {
      foreignKey: 'complaint_id',
      as: 'complaint'
    });

    CaseTimeline.belongsTo(models.Application, {
      foreignKey: 'application_id',
      as: 'application'
    });

    CaseTimeline.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return CaseTimeline;
};