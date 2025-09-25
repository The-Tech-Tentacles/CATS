const { encrypt, decrypt } = require('../utils/encryption');

module.exports = (sequelize, DataTypes) => {
  const Complaint = sequelize.define('Complaint', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    complaint_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    complainant_id: {
      type: DataTypes.UUID,
      allowNull: true, // Null for anonymous complaints
      references: {
        model: 'users',
        key: 'id'
      }
    },
    complaint_type_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'complaint_types',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [10, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [50, 5000]
      }
    },
    incident_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    incident_location: {
      type: DataTypes.JSONB,
      allowNull: true,
      validate: {
        isValidLocation(value) {
          if (value && typeof value === 'object') {
            const required = ['address', 'city', 'state'];
            const missing = required.filter(field => !value[field]);
            if (missing.length > 0) {
              throw new Error(`Missing location fields: ${missing.join(', ')}`);
            }
          }
        }
      }
    },
    suspect_details: {
      type: DataTypes.TEXT, // Encrypted
      allowNull: true
    },
    financial_loss: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'INR',
      validate: {
        len: [3, 3]
      }
    },
    status: {
      type: DataTypes.ENUM(
        'draft',
        'submitted',
        'under_review',
        'investigation',
        'pending_info',
        'action_taken',
        'closed',
        'rejected',
        'appealed'
      ),
      defaultValue: 'submitted'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    classification: {
      type: DataTypes.JSONB,
      defaultValue: {},
      validate: {
        isValidClassification(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Classification must be an object');
          }
        }
      }
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
    is_anonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_sensitive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    requires_immediate_attention: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    source: {
      type: DataTypes.ENUM('web', 'mobile', 'phone', 'email', 'walk_in', 'other'),
      defaultValue: 'web'
    },
    contact_preference: {
      type: DataTypes.ENUM('email', 'sms', 'phone', 'none'),
      defaultValue: 'email'
    },
    additional_info: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    form_data: {
      type: DataTypes.JSONB,
      defaultValue: {},
      validate: {
        isValidFormData(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Form data must be an object');
          }
        }
      }
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    acknowledged_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    investigation_started_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sla_deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    escalated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    escalation_level: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    },
    resolution_summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    closure_reason: {
      type: DataTypes.ENUM(
        'resolved',
        'duplicate',
        'insufficient_info',
        'outside_jurisdiction',
        'withdrawn',
        'false_complaint',
        'other'
      ),
      allowNull: true
    },
    satisfaction_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    feedback_comments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    internal_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    external_reference: {
      type: DataTypes.STRING,
      allowNull: true
    },
    related_complaints: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Related complaints must be an array');
          }
        }
      }
    },
    statistics: {
      type: DataTypes.JSONB,
      defaultValue: {
        views: 0,
        updates: 0,
        messages: 0,
        evidence_files: 0
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'complaints',
    indexes: [
      {
        unique: true,
        fields: ['complaint_number']
      },
      {
        fields: ['complainant_id']
      },
      {
        fields: ['complaint_type_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['severity']
      },
      {
        fields: ['submitted_at']
      },
      {
        fields: ['sla_deadline']
      },
      {
        fields: ['is_anonymous']
      },
      {
        fields: ['is_sensitive']
      },
      {
        fields: ['requires_immediate_attention']
      },
      {
        fields: ['escalation_level']
      },
      {
        fields: ['created_at']
      }
    ],
    hooks: {
      beforeCreate: async (complaint) => {
        // Generate complaint number
        if (!complaint.complaint_number) {
          const year = new Date().getFullYear();
          const month = String(new Date().getMonth() + 1).padStart(2, '0');
          const count = await sequelize.models.Complaint.count({
            where: {
              created_at: {
                [sequelize.Op.gte]: new Date(year, 0, 1),
                [sequelize.Op.lt]: new Date(year + 1, 0, 1)
              }
            }
          });
          complaint.complaint_number = `CC${year}${month}${String(count + 1).padStart(6, '0')}`;
        }

        // Set submitted_at if status is submitted
        if (complaint.status === 'submitted' && !complaint.submitted_at) {
          complaint.submitted_at = new Date();
        }

        // Encrypt sensitive fields
        if (complaint.suspect_details) {
          complaint.suspect_details = encrypt(complaint.suspect_details);
        }
      },
      beforeUpdate: async (complaint) => {
        // Update timestamps based on status changes
        if (complaint.changed('status')) {
          const now = new Date();
          switch (complaint.status) {
            case 'submitted':
              if (!complaint.submitted_at) complaint.submitted_at = now;
              break;
            case 'under_review':
              if (!complaint.acknowledged_at) complaint.acknowledged_at = now;
              break;
            case 'investigation':
              if (!complaint.investigation_started_at) complaint.investigation_started_at = now;
              break;
            case 'action_taken':
              if (!complaint.resolved_at) complaint.resolved_at = now;
              break;
            case 'closed':
              if (!complaint.closed_at) complaint.closed_at = now;
              break;
          }
        }

        // Encrypt sensitive fields if changed
        if (complaint.changed('suspect_details') && complaint.suspect_details) {
          complaint.suspect_details = encrypt(complaint.suspect_details);
        }
      }
    }
  });

  // Instance methods
  Complaint.prototype.getDecryptedSuspectDetails = function() {
    return this.suspect_details ? decrypt(this.suspect_details) : null;
  };

  Complaint.prototype.isOverdue = function() {
    return this.sla_deadline && new Date() > this.sla_deadline;
  };

  Complaint.prototype.getTimeRemaining = function() {
    if (!this.sla_deadline) return null;
    
    const now = new Date();
    const remaining = this.sla_deadline - now;
    
    if (remaining <= 0) return { overdue: true, hours: 0, minutes: 0 };
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return { overdue: false, hours, minutes };
  };

  Complaint.prototype.canBeUpdatedBy = function(user) {
    // Anonymous complaints can't be updated
    if (this.is_anonymous) return false;
    
    // Complainant can update their own complaint
    if (this.complainant_id === user.id) return true;
    
    // Officers and admins can update assigned complaints
    // This would need to check user roles and assignments
    return false;
  };

  Complaint.prototype.incrementViews = async function() {
    const stats = { ...this.statistics };
    stats.views = (stats.views || 0) + 1;
    return this.update({ statistics: stats });
  };

  Complaint.prototype.incrementUpdates = async function() {
    const stats = { ...this.statistics };
    stats.updates = (stats.updates || 0) + 1;
    return this.update({ statistics: stats });
  };

  Complaint.prototype.addTag = async function(tag) {
    if (!this.tags.includes(tag)) {
      const tags = [...this.tags, tag];
      return this.update({ tags });
    }
    return this;
  };

  Complaint.prototype.removeTag = async function(tag) {
    const tags = this.tags.filter(t => t !== tag);
    return this.update({ tags });
  };

  Complaint.prototype.escalate = async function(reason = null) {
    const escalation_level = this.escalation_level + 1;
    const escalated_at = new Date();
    const metadata = { ...this.metadata };
    
    if (!metadata.escalations) metadata.escalations = [];
    metadata.escalations.push({
      level: escalation_level,
      reason,
      escalated_at
    });

    return this.update({
      escalation_level,
      escalated_at,
      metadata
    });
  };

  Complaint.prototype.toSafeJSON = function() {
    const complaint = this.toJSON();
    
    // Remove encrypted fields from public view
    delete complaint.suspect_details;
    delete complaint.internal_notes;
    
    // Remove sensitive metadata
    if (complaint.metadata && complaint.metadata.internal) {
      delete complaint.metadata.internal;
    }
    
    return complaint;
  };

  // Class methods
  Complaint.findByNumber = function(complaintNumber) {
    return this.findOne({ where: { complaint_number: complaintNumber } });
  };

  Complaint.getOverdueComplaints = function() {
    return this.findAll({
      where: {
        sla_deadline: {
          [sequelize.Op.lt]: new Date()
        },
        status: {
          [sequelize.Op.notIn]: ['closed', 'rejected']
        }
      },
      order: [['sla_deadline', 'ASC']]
    });
  };

  Complaint.getUrgentComplaints = function() {
    return this.findAll({
      where: {
        [sequelize.Op.or]: [
          { priority: 'critical' },
          { requires_immediate_attention: true },
          { escalation_level: { [sequelize.Op.gte]: 2 } }
        ],
        status: {
          [sequelize.Op.notIn]: ['closed', 'rejected']
        }
      },
      order: [['priority', 'DESC'], ['escalation_level', 'DESC'], ['created_at', 'ASC']]
    });
  };

  Complaint.getByStatus = function(status) {
    return this.findAll({
      where: { status },
      order: [['created_at', 'DESC']]
    });
  };

  Complaint.getByComplainant = function(complainantId) {
    return this.findAll({
      where: { complainant_id: complainantId },
      order: [['created_at', 'DESC']]
    });
  };

  Complaint.getStatistics = async function(filters = {}) {
    const whereClause = { ...filters };
    
    const stats = await this.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'closed' THEN 1 END")), 'closed'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'investigation' THEN 1 END")), 'under_investigation'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN sla_deadline < NOW() AND status NOT IN ('closed', 'rejected') THEN 1 END")), 'overdue'],
        [sequelize.fn('AVG', sequelize.literal("CASE WHEN status = 'closed' AND closed_at IS NOT NULL THEN EXTRACT(EPOCH FROM (closed_at - submitted_at))/3600 END")), 'avg_resolution_hours']
      ],
      raw: true
    });

    return {
      total: parseInt(stats[0].total) || 0,
      closed: parseInt(stats[0].closed) || 0,
      under_investigation: parseInt(stats[0].under_investigation) || 0,
      overdue: parseInt(stats[0].overdue) || 0,
      average_resolution_time: parseFloat(stats[0].avg_resolution_hours) || 0
    };
  };

  // Associations
  Complaint.associate = function(models) {
    Complaint.belongsTo(models.User, {
      foreignKey: 'complainant_id',
      as: 'complainant'
    });

    Complaint.belongsTo(models.ComplaintType, {
      foreignKey: 'complaint_type_id',
      as: 'complaint_type'
    });

    Complaint.hasMany(models.Evidence, {
      foreignKey: 'complaint_id',
      as: 'evidence'
    });

    Complaint.hasMany(models.CaseTimeline, {
      foreignKey: 'complaint_id',
      as: 'timeline'
    });

    Complaint.hasMany(models.Message, {
      foreignKey: 'complaint_id',
      as: 'messages'
    });

    Complaint.hasMany(models.OfficerAssignment, {
      foreignKey: 'complaint_id',
      as: 'assignments'
    });

    Complaint.hasMany(models.Feedback, {
      foreignKey: 'complaint_id',
      as: 'feedback'
    });

    Complaint.hasMany(models.Appeal, {
      foreignKey: 'complaint_id',
      as: 'appeals'
    });

    Complaint.hasMany(models.Notification, {
      foreignKey: 'related_id',
      as: 'notifications',
      scope: {
        related_type: 'complaint'
      }
    });
  };

  return Complaint;
};