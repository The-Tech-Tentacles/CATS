module.exports = (sequelize, DataTypes) => {
  const OfficerAssignment = sequelize.define('OfficerAssignment', {
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
    appeal_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'appeals',
        key: 'id'
      }
    },
    officer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assigned_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assignment_type: {
      type: DataTypes.ENUM(
        'primary',
        'secondary',
        'supervisor',
        'reviewer',
        'specialist',
        'temporary',
        'backup',
        'escalation'
      ),
      defaultValue: 'primary'
    },
    role: {
      type: DataTypes.ENUM(
        'investigating_officer',
        'case_officer',
        'reviewing_officer',
        'supervising_officer',
        'technical_expert',
        'legal_advisor',
        'forensic_analyst',
        'field_officer',
        'coordinator',
        'other'
      ),
      allowNull: false
    },
    responsibilities: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Responsibilities must be an array');
          }
        }
      }
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'transferred', 'suspended', 'cancelled'),
      defaultValue: 'active'
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    accepted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    transferred_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    transferred_to: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    transfer_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    estimated_hours: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1
      }
    },
    actual_hours: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    },
    workload_percentage: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      validate: {
        min: 1,
        max: 100
      }
    },
    specialization_required: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Specialization required must be an array');
          }
        }
      }
    },
    access_level: {
      type: DataTypes.ENUM('read', 'write', 'full', 'restricted'),
      defaultValue: 'full'
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Permissions must be an array');
          }
        }
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    assignment_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    performance_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    auto_assigned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    assignment_criteria: {
      type: DataTypes.JSONB,
      defaultValue: {},
      validate: {
        isValidCriteria(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Assignment criteria must be an object');
          }
        }
      }
    },
    escalation_level: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    },
    last_activity_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    statistics: {
      type: DataTypes.JSONB,
      defaultValue: {
        actions_taken: 0,
        messages_sent: 0,
        evidence_reviewed: 0,
        updates_made: 0
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'officer_assignments',
    indexes: [
      {
        fields: ['complaint_id']
      },
      {
        fields: ['application_id']
      },
      {
        fields: ['appeal_id']
      },
      {
        fields: ['officer_id']
      },
      {
        fields: ['assigned_by']
      },
      {
        fields: ['assignment_type']
      },
      {
        fields: ['role']
      },
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['is_primary']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['assigned_at']
      },
      {
        fields: ['deadline']
      },
      {
        fields: ['escalation_level']
      },
      {
        fields: ['transferred_to']
      }
    ],
    hooks: {
      beforeUpdate: async (assignment) => {
        // Update timestamps based on status changes
        if (assignment.changed('status')) {
          const now = new Date();
          switch (assignment.status) {
            case 'active':
              if (!assignment.accepted_at) assignment.accepted_at = now;
              break;
            case 'completed':
              if (!assignment.completed_at) assignment.completed_at = now;
              break;
            case 'transferred':
              if (!assignment.transferred_at) assignment.transferred_at = now;
              break;
          }
        }
      }
    }
  });

  // Instance methods
  OfficerAssignment.prototype.isOverdue = function() {
    return this.deadline && new Date() > this.deadline;
  };

  OfficerAssignment.prototype.getTimeRemaining = function() {
    if (!this.deadline) return null;
    
    const now = new Date();
    const remaining = this.deadline - now;
    
    if (remaining <= 0) return { overdue: true, days: 0, hours: 0 };
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { overdue: false, days, hours };
  };

  OfficerAssignment.prototype.accept = async function() {
    return this.update({
      status: 'active',
      accepted_at: new Date(),
      started_at: new Date()
    });
  };

  OfficerAssignment.prototype.complete = async function(feedback = null, rating = null) {
    const updates = {
      status: 'completed',
      completed_at: new Date()
    };

    if (feedback) updates.feedback = feedback;
    if (rating) updates.performance_rating = rating;

    return this.update(updates);
  };

  OfficerAssignment.prototype.transfer = async function(newOfficerId, reason, transferredBy) {
    const updates = {
      status: 'transferred',
      transferred_at: new Date(),
      transferred_to: newOfficerId,
      transfer_reason: reason
    };

    // Create new assignment for the new officer
    const newAssignment = await OfficerAssignment.create({
      complaint_id: this.complaint_id,
      application_id: this.application_id,
      appeal_id: this.appeal_id,
      officer_id: newOfficerId,
      assigned_by: transferredBy,
      assignment_type: this.assignment_type,
      role: this.role,
      responsibilities: this.responsibilities,
      priority: this.priority,
      deadline: this.deadline,
      estimated_hours: this.estimated_hours,
      workload_percentage: this.workload_percentage,
      specialization_required: this.specialization_required,
      access_level: this.access_level,
      permissions: this.permissions,
      is_primary: this.is_primary,
      assignment_reason: `Transferred from officer ${this.officer_id}. Reason: ${reason}`,
      metadata: {
        ...this.metadata,
        transferred_from: this.id,
        transfer_reason: reason
      }
    });

    await this.update(updates);
    return newAssignment;
  };

  OfficerAssignment.prototype.suspend = async function(reason) {
    return this.update({
      status: 'suspended',
      is_active: false,
      notes: this.notes ? `${this.notes}\n\nSuspended: ${reason}` : `Suspended: ${reason}`
    });
  };

  OfficerAssignment.prototype.reactivate = async function() {
    return this.update({
      status: 'active',
      is_active: true
    });
  };

  OfficerAssignment.prototype.updateActivity = async function() {
    return this.update({
      last_activity_at: new Date()
    });
  };

  OfficerAssignment.prototype.incrementStatistic = async function(field, increment = 1) {
    const stats = { ...this.statistics };
    stats[field] = (stats[field] || 0) + increment;
    return this.update({ statistics: stats });
  };

  OfficerAssignment.prototype.updateWorkload = async function(percentage) {
    return this.update({
      workload_percentage: percentage
    });
  };

  OfficerAssignment.prototype.escalate = async function(level, reason) {
    const metadata = { ...this.metadata };
    if (!metadata.escalations) metadata.escalations = [];
    
    metadata.escalations.push({
      from_level: this.escalation_level,
      to_level: level,
      reason,
      escalated_at: new Date()
    });

    return this.update({
      escalation_level: level,
      metadata
    });
  };

  OfficerAssignment.prototype.addResponsibility = async function(responsibility) {
    if (!this.responsibilities.includes(responsibility)) {
      const responsibilities = [...this.responsibilities, responsibility];
      return this.update({ responsibilities });
    }
    return this;
  };

  OfficerAssignment.prototype.removeResponsibility = async function(responsibility) {
    const responsibilities = this.responsibilities.filter(r => r !== responsibility);
    return this.update({ responsibilities });
  };

  OfficerAssignment.prototype.addPermission = async function(permission) {
    if (!this.permissions.includes(permission)) {
      const permissions = [...this.permissions, permission];
      return this.update({ permissions });
    }
    return this;
  };

  OfficerAssignment.prototype.removePermission = async function(permission) {
    const permissions = this.permissions.filter(p => p !== permission);
    return this.update({ permissions });
  };

  OfficerAssignment.prototype.hasPermission = function(permission) {
    return this.permissions.includes(permission) || this.access_level === 'full';
  };

  OfficerAssignment.prototype.canAccess = function(resource) {
    if (this.access_level === 'full') return true;
    if (this.access_level === 'restricted') return false;
    
    // Check specific permissions for read/write access
    return this.hasPermission(`${resource}_${this.access_level}`);
  };

  // Class methods
  OfficerAssignment.findByOfficer = function(officerId, status = 'active') {
    const whereClause = { officer_id: officerId };
    if (status) whereClause.status = status;
    
    return this.findAll({
      where: whereClause,
      order: [['assigned_at', 'DESC']]
    });
  };

  OfficerAssignment.findByComplaint = function(complaintId) {
    return this.findAll({
      where: { complaint_id: complaintId },
      order: [['assigned_at', 'DESC']]
    });
  };

  OfficerAssignment.findByApplication = function(applicationId) {
    return this.findAll({
      where: { application_id: applicationId },
      order: [['assigned_at', 'DESC']]
    });
  };

  OfficerAssignment.findByAppeal = function(appealId) {
    return this.findAll({
      where: { appeal_id: appealId },
      order: [['assigned_at', 'DESC']]
    });
  };

  OfficerAssignment.getPrimaryAssignment = function(caseId, caseType) {
    const whereClause = {
      is_primary: true,
      status: 'active'
    };
    
    if (caseType === 'complaint') {
      whereClause.complaint_id = caseId;
    } else if (caseType === 'application') {
      whereClause.application_id = caseId;
    } else if (caseType === 'appeal') {
      whereClause.appeal_id = caseId;
    }
    
    return this.findOne({ where: whereClause });
  };

  OfficerAssignment.getActiveAssignments = function(officerId = null) {
    const whereClause = {
      status: 'active',
      is_active: true
    };
    
    if (officerId) whereClause.officer_id = officerId;
    
    return this.findAll({
      where: whereClause,
      order: [['priority', 'DESC'], ['assigned_at', 'ASC']]
    });
  };

  OfficerAssignment.getOverdueAssignments = function() {
    return this.findAll({
      where: {
        deadline: {
          [sequelize.Op.lt]: new Date()
        },
        status: 'active'
      },
      order: [['deadline', 'ASC']]
    });
  };

  OfficerAssignment.getWorkloadByOfficer = async function(officerId) {
    const assignments = await this.findAll({
      where: {
        officer_id: officerId,
        status: 'active'
      },
      attributes: ['workload_percentage', 'priority']
    });

    const totalWorkload = assignments.reduce((sum, assignment) => {
      return sum + assignment.workload_percentage;
    }, 0);

    const priorityBreakdown = assignments.reduce((breakdown, assignment) => {
      breakdown[assignment.priority] = (breakdown[assignment.priority] || 0) + 1;
      return breakdown;
    }, {});

    return {
      total_assignments: assignments.length,
      total_workload: totalWorkload,
      priority_breakdown: priorityBreakdown,
      is_overloaded: totalWorkload > 100
    };
  };

  OfficerAssignment.getByRole = function(role) {
    return this.findAll({
      where: { role, status: 'active' },
      order: [['assigned_at', 'DESC']]
    });
  };

  OfficerAssignment.getBySpecialization = function(specialization) {
    return this.findAll({
      where: {
        specialization_required: {
          [sequelize.Op.contains]: [specialization]
        },
        status: 'active'
      },
      order: [['assigned_at', 'DESC']]
    });
  };

  OfficerAssignment.getStatistics = async function(filters = {}) {
    const whereClause = { ...filters };
    
    const stats = await this.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'active' THEN 1 END")), 'active'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'completed' THEN 1 END")), 'completed'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN deadline < NOW() AND status = 'active' THEN 1 END")), 'overdue'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN is_primary = true THEN 1 END")), 'primary_assignments'],
        [sequelize.fn('AVG', sequelize.literal("CASE WHEN status = 'completed' AND completed_at IS NOT NULL THEN EXTRACT(EPOCH FROM (completed_at - assigned_at))/3600 END")), 'avg_completion_hours']
      ],
      raw: true
    });

    return {
      total: parseInt(stats[0].total) || 0,
      active: parseInt(stats[0].active) || 0,
      completed: parseInt(stats[0].completed) || 0,
      overdue: parseInt(stats[0].overdue) || 0,
      primary_assignments: parseInt(stats[0].primary_assignments) || 0,
      average_completion_time: parseFloat(stats[0].avg_completion_hours) || 0
    };
  };

  // Associations
  OfficerAssignment.associate = function(models) {
    OfficerAssignment.belongsTo(models.Complaint, {
      foreignKey: 'complaint_id',
      as: 'complaint'
    });

    OfficerAssignment.belongsTo(models.Application, {
      foreignKey: 'application_id',
      as: 'application'
    });

    OfficerAssignment.belongsTo(models.Appeal, {
      foreignKey: 'appeal_id',
      as: 'appeal'
    });

    OfficerAssignment.belongsTo(models.User, {
      foreignKey: 'officer_id',
      as: 'officer'
    });

    OfficerAssignment.belongsTo(models.User, {
      foreignKey: 'assigned_by',
      as: 'assigner'
    });

    OfficerAssignment.belongsTo(models.User, {
      foreignKey: 'transferred_to',
      as: 'transfer_recipient'
    });
  };

  return OfficerAssignment;
};