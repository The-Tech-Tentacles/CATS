module.exports = (sequelize, DataTypes) => {
  const Appeal = sequelize.define('Appeal', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    appeal_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
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
    appellant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM(
        'complaint_rejection',
        'complaint_closure',
        'application_rejection',
        'service_denial',
        'process_delay',
        'officer_conduct',
        'decision_review',
        'other'
      ),
      allowNull: false
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
        len: [50, 3000]
      }
    },
    grounds: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Grounds must be an array');
          }
        }
      }
    },
    original_decision: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 1000]
      }
    },
    original_decision_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    original_decision_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    requested_relief: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [20, 1000]
      }
    },
    supporting_documents: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Supporting documents must be an array');
          }
        }
      }
    },
    status: {
      type: DataTypes.ENUM(
        'submitted',
        'under_review',
        'additional_info_required',
        'hearing_scheduled',
        'under_hearing',
        'decision_pending',
        'allowed',
        'partially_allowed',
        'dismissed',
        'withdrawn',
        'time_barred'
      ),
      defaultValue: 'submitted'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    urgency_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    acknowledged_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    review_started_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    hearing_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    hearing_location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hearing_type: {
      type: DataTypes.ENUM('in_person', 'video_conference', 'phone', 'written'),
      allowNull: true
    },
    decision_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    decision: {
      type: DataTypes.ENUM('allowed', 'partially_allowed', 'dismissed'),
      allowNull: true
    },
    decision_summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    decision_reasoning: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    decision_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    remedial_action: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    compliance_deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    compliance_status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'overdue'),
      allowNull: true
    },
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sla_deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_time_barred: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    time_bar_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    appeal_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    fee_status: {
      type: DataTypes.ENUM('not_applicable', 'pending', 'paid', 'waived', 'refunded'),
      defaultValue: 'not_applicable'
    },
    fee_paid_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    payment_reference: {
      type: DataTypes.STRING,
      allowNull: true
    },
    previous_appeals: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Previous appeals must be an array');
          }
        }
      }
    },
    related_appeals: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Related appeals must be an array');
          }
        }
      }
    },
    internal_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    public_notes: {
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
    statistics: {
      type: DataTypes.JSONB,
      defaultValue: {
        views: 0,
        updates: 0,
        documents_submitted: 0,
        hearings_conducted: 0
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'appeals',
    indexes: [
      {
        unique: true,
        fields: ['appeal_number']
      },
      {
        fields: ['complaint_id']
      },
      {
        fields: ['application_id']
      },
      {
        fields: ['appellant_id']
      },
      {
        fields: ['type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['assigned_to']
      },
      {
        fields: ['decision_by']
      },
      {
        fields: ['original_decision_by']
      },
      {
        fields: ['submitted_at']
      },
      {
        fields: ['sla_deadline']
      },
      {
        fields: ['hearing_date']
      },
      {
        fields: ['decision_date']
      },
      {
        fields: ['compliance_deadline']
      },
      {
        fields: ['is_time_barred']
      },
      {
        fields: ['fee_status']
      },
      {
        fields: ['created_at']
      }
    ],
    hooks: {
      beforeCreate: async (appeal) => {
        // Generate appeal number
        if (!appeal.appeal_number) {
          const year = new Date().getFullYear();
          const month = String(new Date().getMonth() + 1).padStart(2, '0');
          const count = await sequelize.models.Appeal.count({
            where: {
              created_at: {
                [sequelize.Op.gte]: new Date(year, 0, 1),
                [sequelize.Op.lt]: new Date(year + 1, 0, 1)
              }
            }
          });
          appeal.appeal_number = `APP${year}${month}${String(count + 1).padStart(5, '0')}`;
        }

        // Set submitted_at if status is submitted
        if (appeal.status === 'submitted' && !appeal.submitted_at) {
          appeal.submitted_at = new Date();
        }

        // Check if appeal is time-barred (example: 30 days from original decision)
        if (appeal.original_decision_date) {
          const timeLimit = new Date(appeal.original_decision_date);
          timeLimit.setDate(timeLimit.getDate() + 30); // 30 days limit
          
          if (new Date() > timeLimit) {
            appeal.is_time_barred = true;
            appeal.time_bar_reason = 'Appeal filed beyond the statutory time limit of 30 days';
          }
        }

        // Set SLA deadline (example: 60 days from submission)
        if (!appeal.sla_deadline) {
          const deadline = new Date();
          deadline.setDate(deadline.getDate() + 60);
          appeal.sla_deadline = deadline;
        }
      },
      beforeUpdate: async (appeal) => {
        // Update timestamps based on status changes
        if (appeal.changed('status')) {
          const now = new Date();
          switch (appeal.status) {
            case 'submitted':
              if (!appeal.submitted_at) appeal.submitted_at = now;
              break;
            case 'under_review':
              if (!appeal.acknowledged_at) appeal.acknowledged_at = now;
              if (!appeal.review_started_at) appeal.review_started_at = now;
              break;
            case 'allowed':
            case 'partially_allowed':
            case 'dismissed':
              if (!appeal.decision_date) appeal.decision_date = now;
              break;
          }
        }

        // Set decision when status changes to final decision
        if (appeal.changed('status') && ['allowed', 'partially_allowed', 'dismissed'].includes(appeal.status)) {
          if (!appeal.decision) {
            appeal.decision = appeal.status;
          }
        }
      }
    }
  });

  // Instance methods
  Appeal.prototype.isOverdue = function() {
    return this.sla_deadline && new Date() > this.sla_deadline;
  };

  Appeal.prototype.getTimeRemaining = function() {
    if (!this.sla_deadline) return null;
    
    const now = new Date();
    const remaining = this.sla_deadline - now;
    
    if (remaining <= 0) return { overdue: true, days: 0, hours: 0 };
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { overdue: false, days, hours };
  };

  Appeal.prototype.isComplianceOverdue = function() {
    return this.compliance_deadline && new Date() > this.compliance_deadline;
  };

  Appeal.prototype.canBeUpdatedBy = function(user) {
    // Appellant can update their own appeal
    if (this.appellant_id === user.id) return true;
    
    // Assigned officer can update
    if (this.assigned_to === user.id) return true;
    
    // Admins can update any appeal
    return user.hasRole(['admin', 'super_admin']);
  };

  Appeal.prototype.assign = async function(officerId, assignedBy = null) {
    const updates = {
      assigned_to: officerId,
      assigned_at: new Date()
    };

    if (this.status === 'submitted') {
      updates.status = 'under_review';
      updates.acknowledged_at = new Date();
    }

    const metadata = { ...this.metadata };
    if (!metadata.assignments) metadata.assignments = [];
    metadata.assignments.push({
      officer_id: officerId,
      assigned_by: assignedBy,
      assigned_at: new Date()
    });
    updates.metadata = metadata;

    return this.update(updates);
  };

  Appeal.prototype.scheduleHearing = async function(hearingDate, location, type = 'in_person') {
    return this.update({
      status: 'hearing_scheduled',
      hearing_date: hearingDate,
      hearing_location: location,
      hearing_type: type
    });
  };

  Appeal.prototype.recordDecision = async function(decision, summary, reasoning, decisionBy, remedialAction = null) {
    const updates = {
      status: decision,
      decision,
      decision_summary: summary,
      decision_reasoning: reasoning,
      decision_by: decisionBy,
      decision_date: new Date()
    };

    if (remedialAction) {
      updates.remedial_action = remedialAction;
      // Set compliance deadline (example: 30 days from decision)
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30);
      updates.compliance_deadline = deadline;
      updates.compliance_status = 'pending';
    }

    return this.update(updates);
  };

  Appeal.prototype.withdraw = async function(reason = null) {
    const updates = {
      status: 'withdrawn'
    };

    if (reason) {
      const metadata = { ...this.metadata };
      metadata.withdrawal_reason = reason;
      metadata.withdrawn_at = new Date();
      updates.metadata = metadata;
    }

    return this.update(updates);
  };

  Appeal.prototype.markTimeBarred = async function(reason) {
    return this.update({
      status: 'time_barred',
      is_time_barred: true,
      time_bar_reason: reason
    });
  };

  Appeal.prototype.updateCompliance = async function(status, notes = null) {
    const updates = { compliance_status: status };

    if (notes) {
      const metadata = { ...this.metadata };
      if (!metadata.compliance_updates) metadata.compliance_updates = [];
      metadata.compliance_updates.push({
        status,
        notes,
        updated_at: new Date()
      });
      updates.metadata = metadata;
    }

    return this.update(updates);
  };

  Appeal.prototype.addDocument = async function(document) {
    const documents = [...this.supporting_documents, document];
    const stats = { ...this.statistics };
    stats.documents_submitted = (stats.documents_submitted || 0) + 1;
    
    return this.update({
      supporting_documents: documents,
      statistics: stats
    });
  };

  Appeal.prototype.incrementViews = async function() {
    const stats = { ...this.statistics };
    stats.views = (stats.views || 0) + 1;
    return this.update({ statistics: stats });
  };

  Appeal.prototype.addTag = async function(tag) {
    if (!this.tags.includes(tag)) {
      const tags = [...this.tags, tag];
      return this.update({ tags });
    }
    return this;
  };

  Appeal.prototype.removeTag = async function(tag) {
    const tags = this.tags.filter(t => t !== tag);
    return this.update({ tags });
  };

  Appeal.prototype.toSafeJSON = function() {
    const appeal = this.toJSON();
    
    // Remove internal notes from public view
    delete appeal.internal_notes;
    
    // Remove sensitive metadata
    if (appeal.metadata && appeal.metadata.internal) {
      delete appeal.metadata.internal;
    }
    
    return appeal;
  };

  // Class methods
  Appeal.findByNumber = function(appealNumber) {
    return this.findOne({ where: { appeal_number: appealNumber } });
  };

  Appeal.findByComplaint = function(complaintId) {
    return this.findAll({
      where: { complaint_id: complaintId },
      order: [['created_at', 'DESC']]
    });
  };

  Appeal.findByApplication = function(applicationId) {
    return this.findAll({
      where: { application_id: applicationId },
      order: [['created_at', 'DESC']]
    });
  };

  Appeal.findByAppellant = function(appellantId) {
    return this.findAll({
      where: { appellant_id: appellantId },
      order: [['created_at', 'DESC']]
    });
  };

  Appeal.getOverdueAppeals = function() {
    return this.findAll({
      where: {
        sla_deadline: {
          [sequelize.Op.lt]: new Date()
        },
        status: {
          [sequelize.Op.notIn]: ['allowed', 'partially_allowed', 'dismissed', 'withdrawn', 'time_barred']
        }
      },
      order: [['sla_deadline', 'ASC']]
    });
  };

  Appeal.getOverdueCompliance = function() {
    return this.findAll({
      where: {
        compliance_deadline: {
          [sequelize.Op.lt]: new Date()
        },
        compliance_status: {
          [sequelize.Op.in]: ['pending', 'in_progress']
        }
      },
      order: [['compliance_deadline', 'ASC']]
    });
  };

  Appeal.getByStatus = function(status) {
    return this.findAll({
      where: { status },
      order: [['created_at', 'DESC']]
    });
  };

  Appeal.getByType = function(type) {
    return this.findAll({
      where: { type },
      order: [['created_at', 'DESC']]
    });
  };

  Appeal.getUpcomingHearings = function(days = 7) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    return this.findAll({
      where: {
        hearing_date: {
          [sequelize.Op.between]: [new Date(), endDate]
        },
        status: {
          [sequelize.Op.in]: ['hearing_scheduled', 'under_hearing']
        }
      },
      order: [['hearing_date', 'ASC']]
    });
  };

  Appeal.getStatistics = async function(filters = {}) {
    const whereClause = { ...filters };
    
    const stats = await this.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'allowed' THEN 1 END")), 'allowed'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'dismissed' THEN 1 END")), 'dismissed'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'partially_allowed' THEN 1 END")), 'partially_allowed'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN sla_deadline < NOW() AND status NOT IN ('allowed', 'dismissed', 'partially_allowed', 'withdrawn', 'time_barred') THEN 1 END")), 'overdue'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN is_time_barred = true THEN 1 END")), 'time_barred'],
        [sequelize.fn('AVG', sequelize.literal("CASE WHEN decision_date IS NOT NULL THEN EXTRACT(EPOCH FROM (decision_date - submitted_at))/86400 END")), 'avg_decision_days']
      ],
      raw: true
    });

    return {
      total: parseInt(stats[0].total) || 0,
      allowed: parseInt(stats[0].allowed) || 0,
      dismissed: parseInt(stats[0].dismissed) || 0,
      partially_allowed: parseInt(stats[0].partially_allowed) || 0,
      overdue: parseInt(stats[0].overdue) || 0,
      time_barred: parseInt(stats[0].time_barred) || 0,
      average_decision_days: parseFloat(stats[0].avg_decision_days) || 0
    };
  };

  // Associations
  Appeal.associate = function(models) {
    Appeal.belongsTo(models.Complaint, {
      foreignKey: 'complaint_id',
      as: 'complaint'
    });

    Appeal.belongsTo(models.Application, {
      foreignKey: 'application_id',
      as: 'application'
    });

    Appeal.belongsTo(models.User, {
      foreignKey: 'appellant_id',
      as: 'appellant'
    });

    Appeal.belongsTo(models.User, {
      foreignKey: 'assigned_to',
      as: 'assigned_officer'
    });

    Appeal.belongsTo(models.User, {
      foreignKey: 'decision_by',
      as: 'decision_maker'
    });

    Appeal.belongsTo(models.User, {
      foreignKey: 'original_decision_by',
      as: 'original_decision_maker'
    });

    Appeal.hasMany(models.CaseTimeline, {
      foreignKey: 'appeal_id',
      as: 'timeline'
    });

    Appeal.hasMany(models.Message, {
      foreignKey: 'appeal_id',
      as: 'messages'
    });

    Appeal.hasMany(models.Evidence, {
      foreignKey: 'appeal_id',
      as: 'evidence'
    });
  };

  return Appeal;
};