module.exports = (sequelize, DataTypes) => {
  const SLARule = sequelize.define('SLARule', {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    complaint_type_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'complaint_types',
        key: 'id'
      }
    },
    application_type: {
      type: DataTypes.ENUM(
        'noc_cyber_clearance',
        'character_verification',
        'cyber_security_audit',
        'digital_forensics',
        'awareness_program',
        'training_request',
        'consultation',
        'other',
        'all'
      ),
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: true
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: true
    },
    conditions: {
      type: DataTypes.JSONB,
      defaultValue: {},
      validate: {
        isValidConditions(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Conditions must be an object');
          }
        }
      }
    },
    acknowledgment_time: {
      type: DataTypes.INTEGER, // Hours
      allowNull: true,
      validate: {
        min: 1
      }
    },
    first_response_time: {
      type: DataTypes.INTEGER, // Hours
      allowNull: true,
      validate: {
        min: 1
      }
    },
    resolution_time: {
      type: DataTypes.INTEGER, // Hours
      allowNull: false,
      validate: {
        min: 1
      }
    },
    escalation_levels: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Escalation levels must be an array');
          }
        }
      }
    },
    business_hours_only: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    business_hours: {
      type: DataTypes.JSONB,
      defaultValue: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: null,
        sunday: null
      },
      validate: {
        isValidHours(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Business hours must be an object');
          }
        }
      }
    },
    holidays: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Holidays must be an array');
          }
        }
      }
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'Asia/Kolkata',
      validate: {
        len: [1, 50]
      }
    },
    auto_escalate: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    escalation_notifications: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Escalation notifications must be an array');
          }
        }
      }
    },
    breach_notifications: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Breach notifications must be an array');
          }
        }
      }
    },
    warning_thresholds: {
      type: DataTypes.JSONB,
      defaultValue: [75, 90], // Percentage of SLA time
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Warning thresholds must be an array');
          }
        }
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    effective_from: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    effective_until: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    statistics: {
      type: DataTypes.JSONB,
      defaultValue: {
        total_cases: 0,
        breached_cases: 0,
        average_resolution_time: 0,
        compliance_rate: 100
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'sla_rules',
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        fields: ['complaint_type_id']
      },
      {
        fields: ['application_type']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['severity']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['effective_from']
      },
      {
        fields: ['effective_until']
      },
      {
        fields: ['created_by']
      }
    ]
  });

  // Instance methods
  SLARule.prototype.isEffective = function(date = new Date()) {
    if (!this.is_active) return false;
    if (this.effective_from && date < this.effective_from) return false;
    if (this.effective_until && date > this.effective_until) return false;
    return true;
  };

  SLARule.prototype.calculateDeadline = function(startDate, type = 'resolution') {
    const hours = type === 'acknowledgment' ? this.acknowledgment_time :
                  type === 'first_response' ? this.first_response_time :
                  this.resolution_time;

    if (!hours) return null;

    if (!this.business_hours_only) {
      // Simple calculation for 24/7 operations
      const deadline = new Date(startDate);
      deadline.setHours(deadline.getHours() + hours);
      return deadline;
    }

    // Complex calculation considering business hours and holidays
    return this.calculateBusinessHoursDeadline(startDate, hours);
  };

  SLARule.prototype.calculateBusinessHoursDeadline = function(startDate, hours) {
    const moment = require('moment-timezone');
    let current = moment(startDate).tz(this.timezone);
    let remainingHours = hours;

    while (remainingHours > 0) {
      const dayName = current.format('dddd').toLowerCase();
      const businessHour = this.business_hours[dayName];

      // Skip if it's a holiday
      if (this.isHoliday(current.format('YYYY-MM-DD'))) {
        current.add(1, 'day').startOf('day');
        continue;
      }

      // Skip if no business hours for this day
      if (!businessHour) {
        current.add(1, 'day').startOf('day');
        continue;
      }

      const startTime = moment(current).startOf('day').add(moment.duration(businessHour.start));
      const endTime = moment(current).startOf('day').add(moment.duration(businessHour.end));

      // If current time is before business hours, move to start of business hours
      if (current.isBefore(startTime)) {
        current = startTime.clone();
      }

      // If current time is after business hours, move to next day
      if (current.isAfter(endTime)) {
        current.add(1, 'day').startOf('day');
        continue;
      }

      // Calculate available hours for this day
      const availableHours = endTime.diff(current, 'hours', true);
      
      if (remainingHours <= availableHours) {
        // We can finish within this business day
        current.add(remainingHours, 'hours');
        remainingHours = 0;
      } else {
        // Use all available hours and move to next day
        remainingHours -= availableHours;
        current.add(1, 'day').startOf('day');
      }
    }

    return current.toDate();
  };

  SLARule.prototype.isHoliday = function(dateString) {
    return this.holidays.includes(dateString);
  };

  SLARule.prototype.getEscalationLevel = function(elapsedHours) {
    const totalHours = this.resolution_time;
    const elapsedPercentage = (elapsedHours / totalHours) * 100;

    for (let i = 0; i < this.escalation_levels.length; i++) {
      const level = this.escalation_levels[i];
      if (elapsedPercentage >= level.threshold) {
        return level;
      }
    }

    return null;
  };

  SLARule.prototype.shouldEscalate = function(elapsedHours, currentLevel = 0) {
    if (!this.auto_escalate) return false;

    const escalationLevel = this.getEscalationLevel(elapsedHours);
    return escalationLevel && escalationLevel.level > currentLevel;
  };

  SLARule.prototype.getWarningThreshold = function(thresholdIndex = 0) {
    if (thresholdIndex >= this.warning_thresholds.length) return null;
    
    const percentage = this.warning_thresholds[thresholdIndex];
    return (this.resolution_time * percentage) / 100;
  };

  SLARule.prototype.isBreached = function(elapsedHours) {
    return elapsedHours > this.resolution_time;
  };

  SLARule.prototype.getComplianceRate = function() {
    if (this.statistics.total_cases === 0) return 100;
    return ((this.statistics.total_cases - this.statistics.breached_cases) / this.statistics.total_cases) * 100;
  };

  SLARule.prototype.updateStatistics = async function() {
    const models = require('./index');
    
    // This would need to be implemented based on your specific requirements
    // Example implementation for complaints:
    if (this.complaint_type_id) {
      const stats = await models.Complaint.findAll({
        where: { complaint_type_id: this.complaint_type_id },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
          [sequelize.fn('COUNT', sequelize.literal("CASE WHEN sla_deadline < NOW() AND status NOT IN ('closed', 'rejected') THEN 1 END")), 'breached'],
          [sequelize.fn('AVG', sequelize.literal("CASE WHEN status = 'closed' AND closed_at IS NOT NULL THEN EXTRACT(EPOCH FROM (closed_at - submitted_at))/3600 END")), 'avg_resolution_hours']
        ],
        raw: true
      });

      const statistics = {
        total_cases: parseInt(stats[0].total) || 0,
        breached_cases: parseInt(stats[0].breached) || 0,
        average_resolution_time: parseFloat(stats[0].avg_resolution_hours) || 0,
        compliance_rate: this.getComplianceRate()
      };

      return this.update({ statistics });
    }

    return this;
  };

  SLARule.prototype.addHoliday = async function(date) {
    if (!this.holidays.includes(date)) {
      const holidays = [...this.holidays, date];
      return this.update({ holidays });
    }
    return this;
  };

  SLARule.prototype.removeHoliday = async function(date) {
    const holidays = this.holidays.filter(h => h !== date);
    return this.update({ holidays });
  };

  // Class methods
  SLARule.findByComplaintType = function(complaintTypeId) {
    return this.findOne({
      where: {
        complaint_type_id: complaintTypeId,
        is_active: true,
        effective_from: { [sequelize.Op.lte]: new Date() },
        [sequelize.Op.or]: [
          { effective_until: null },
          { effective_until: { [sequelize.Op.gte]: new Date() } }
        ]
      }
    });
  };

  SLARule.findByApplicationType = function(applicationType) {
    return this.findOne({
      where: {
        [sequelize.Op.or]: [
          { application_type: applicationType },
          { application_type: 'all' }
        ],
        is_active: true,
        effective_from: { [sequelize.Op.lte]: new Date() },
        [sequelize.Op.or]: [
          { effective_until: null },
          { effective_until: { [sequelize.Op.gte]: new Date() } }
        ]
      },
      order: [
        [sequelize.literal("CASE WHEN application_type = ? THEN 1 ELSE 2 END"), 'ASC']
      ]
    });
  };

  SLARule.findByConditions = function(conditions) {
    return this.findAll({
      where: {
        is_active: true,
        effective_from: { [sequelize.Op.lte]: new Date() },
        [sequelize.Op.or]: [
          { effective_until: null },
          { effective_until: { [sequelize.Op.gte]: new Date() } }
        ]
      }
    }).then(rules => {
      // Filter rules based on conditions
      return rules.filter(rule => this.matchesConditions(rule.conditions, conditions));
    });
  };

  SLARule.matchesConditions = function(ruleConditions, actualConditions) {
    if (!ruleConditions || Object.keys(ruleConditions).length === 0) return true;

    for (const [key, value] of Object.entries(ruleConditions)) {
      if (actualConditions[key] !== value) {
        return false;
      }
    }

    return true;
  };

  SLARule.getActiveRules = function() {
    return this.findAll({
      where: {
        is_active: true,
        effective_from: { [sequelize.Op.lte]: new Date() },
        [sequelize.Op.or]: [
          { effective_until: null },
          { effective_until: { [sequelize.Op.gte]: new Date() } }
        ]
      },
      order: [['name', 'ASC']]
    });
  };

  SLARule.getExpiredRules = function() {
    return this.findAll({
      where: {
        effective_until: { [sequelize.Op.lt]: new Date() }
      },
      order: [['effective_until', 'DESC']]
    });
  };

  // Associations
  SLARule.associate = function(models) {
    SLARule.belongsTo(models.ComplaintType, {
      foreignKey: 'complaint_type_id',
      as: 'complaint_type'
    });

    SLARule.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    SLARule.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });
  };

  return SLARule;
};