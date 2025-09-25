module.exports = (sequelize, DataTypes) => {
  const ComplaintType = sequelize.define('ComplaintType', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [2, 100]
      }
    },
    display_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 150]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM(
        'cybercrime',
        'financial_fraud',
        'identity_theft',
        'online_harassment',
        'data_breach',
        'phishing',
        'malware',
        'social_media_crime',
        'e_commerce_fraud',
        'cyber_terrorism',
        'child_exploitation',
        'other'
      ),
      allowNull: false
    },
    severity_level: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    priority_score: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
      validate: {
        min: 1,
        max: 100
      }
    },
    sla_hours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 72,
      validate: {
        min: 1
      }
    },
    required_fields: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Required fields must be an array');
          }
        }
      }
    },
    form_schema: {
      type: DataTypes.JSONB,
      defaultValue: {},
      validate: {
        isValidSchema(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Form schema must be an object');
          }
        }
      }
    },
    auto_assignment_rules: {
      type: DataTypes.JSONB,
      defaultValue: {},
      validate: {
        isValidRules(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Auto assignment rules must be an object');
          }
        }
      }
    },
    escalation_rules: {
      type: DataTypes.JSONB,
      defaultValue: {},
      validate: {
        isValidRules(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Escalation rules must be an object');
          }
        }
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    requires_verification: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    allows_anonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    max_evidence_files: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      validate: {
        min: 0,
        max: 50
      }
    },
    allowed_evidence_types: {
      type: DataTypes.JSONB,
      defaultValue: ['image', 'document', 'video', 'audio'],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Allowed evidence types must be an array');
          }
        }
      }
    },
    workflow_stages: {
      type: DataTypes.JSONB,
      defaultValue: [
        'submitted',
        'under_review',
        'investigation',
        'action_taken',
        'closed'
      ],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Workflow stages must be an array');
          }
        }
      }
    },
    notification_templates: {
      type: DataTypes.JSONB,
      defaultValue: {},
      validate: {
        isValidTemplates(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Notification templates must be an object');
          }
        }
      }
    },
    statistics: {
      type: DataTypes.JSONB,
      defaultValue: {
        total_complaints: 0,
        resolved_complaints: 0,
        average_resolution_time: 0,
        satisfaction_rating: 0
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'complaint_types',
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        fields: ['category']
      },
      {
        fields: ['severity_level']
      },
      {
        fields: ['priority_score']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['is_public']
      }
    ]
  });

  // Instance methods
  ComplaintType.prototype.getSLADeadline = function(startDate = new Date()) {
    const deadline = new Date(startDate);
    deadline.setHours(deadline.getHours() + this.sla_hours);
    return deadline;
  };

  ComplaintType.prototype.isOverdue = function(submittedAt) {
    const deadline = this.getSLADeadline(submittedAt);
    return new Date() > deadline;
  };

  ComplaintType.prototype.getTimeRemaining = function(submittedAt) {
    const deadline = this.getSLADeadline(submittedAt);
    const now = new Date();
    const remaining = deadline - now;
    
    if (remaining <= 0) return { overdue: true, hours: 0, minutes: 0 };
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return { overdue: false, hours, minutes };
  };

  ComplaintType.prototype.updateStatistics = async function() {
    const models = require('./index');
    const stats = await models.Complaint.findAll({
      where: { complaint_type_id: this.id },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'closed' THEN 1 END")), 'resolved'],
        [sequelize.fn('AVG', sequelize.literal("CASE WHEN status = 'closed' AND closed_at IS NOT NULL THEN EXTRACT(EPOCH FROM (closed_at - created_at))/3600 END")), 'avg_resolution_hours']
      ],
      raw: true
    });

    const feedbackStats = await models.Feedback.findAll({
      include: [{
        model: models.Complaint,
        where: { complaint_type_id: this.id },
        attributes: []
      }],
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']
      ],
      raw: true
    });

    const statistics = {
      total_complaints: parseInt(stats[0].total) || 0,
      resolved_complaints: parseInt(stats[0].resolved) || 0,
      average_resolution_time: parseFloat(stats[0].avg_resolution_hours) || 0,
      satisfaction_rating: parseFloat(feedbackStats[0].avg_rating) || 0
    };

    return this.update({ statistics });
  };

  // Class methods
  ComplaintType.findByName = function(name) {
    return this.findOne({ where: { name } });
  };

  ComplaintType.getActiveTypes = function() {
    return this.findAll({
      where: { is_active: true },
      order: [['priority_score', 'DESC'], ['name', 'ASC']]
    });
  };

  ComplaintType.getPublicTypes = function() {
    return this.findAll({
      where: { is_active: true, is_public: true },
      order: [['priority_score', 'DESC'], ['name', 'ASC']]
    });
  };

  ComplaintType.getByCategory = function(category) {
    return this.findAll({
      where: { category, is_active: true },
      order: [['priority_score', 'DESC'], ['name', 'ASC']]
    });
  };

  ComplaintType.getBySeverity = function(severity) {
    return this.findAll({
      where: { severity_level: severity, is_active: true },
      order: [['priority_score', 'DESC'], ['name', 'ASC']]
    });
  };

  // Associations
  ComplaintType.associate = function(models) {
    ComplaintType.hasMany(models.Complaint, {
      foreignKey: 'complaint_type_id',
      as: 'complaints'
    });

    ComplaintType.hasMany(models.SLARule, {
      foreignKey: 'complaint_type_id',
      as: 'sla_rules'
    });
  };

  return ComplaintType;
};