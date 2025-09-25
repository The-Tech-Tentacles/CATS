module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM(
        'complaint_submitted',
        'complaint_acknowledged',
        'complaint_assigned',
        'complaint_status_changed',
        'complaint_resolved',
        'complaint_closed',
        'application_submitted',
        'application_approved',
        'application_rejected',
        'message_received',
        'evidence_uploaded',
        'deadline_approaching',
        'deadline_exceeded',
        'escalation',
        'reminder',
        'system_maintenance',
        'security_alert',
        'password_expiry',
        'certificate_expiry',
        'payment_due',
        'payment_received',
        'document_required',
        'feedback_request',
        'appeal_submitted',
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
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 1000]
      }
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    category: {
      type: DataTypes.ENUM(
        'information',
        'action_required',
        'warning',
        'error',
        'success',
        'reminder',
        'system',
        'security',
        'other'
      ),
      defaultValue: 'information'
    },
    channels: {
      type: DataTypes.JSONB,
      defaultValue: ['in_app'],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Channels must be an array');
          }
          const validChannels = ['in_app', 'email', 'sms', 'push', 'webhook'];
          const invalidChannels = value.filter(channel => !validChannels.includes(channel));
          if (invalidChannels.length > 0) {
            throw new Error(`Invalid channels: ${invalidChannels.join(', ')}`);
          }
        }
      }
    },
    delivery_status: {
      type: DataTypes.JSONB,
      defaultValue: {},
      validate: {
        isValidStatus(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Delivery status must be an object');
          }
        }
      }
    },
    related_type: {
      type: DataTypes.ENUM('complaint', 'application', 'message', 'user', 'system', 'other'),
      allowNull: true
    },
    related_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    related_identifier: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 100]
      }
    },
    action_url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    action_text: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 50]
      }
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_dismissed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    dismissed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    archived_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    retry_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    max_retries: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      validate: {
        min: 0,
        max: 10
      }
    },
    last_retry_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    template_id: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 100]
      }
    },
    template_data: {
      type: DataTypes.JSONB,
      defaultValue: {},
      validate: {
        isValidData(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Template data must be an object');
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
    tableName: 'notifications',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['type']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['category']
      },
      {
        fields: ['related_type', 'related_id']
      },
      {
        fields: ['is_read']
      },
      {
        fields: ['is_dismissed']
      },
      {
        fields: ['is_archived']
      },
      {
        fields: ['scheduled_at']
      },
      {
        fields: ['sent_at']
      },
      {
        fields: ['expires_at']
      },
      {
        fields: ['created_at']
      }
    ],
    hooks: {
      beforeUpdate: async (notification) => {
        // Update read timestamp if marked as read
        if (notification.changed('is_read') && notification.is_read && !notification.read_at) {
          notification.read_at = new Date();
        }

        // Update dismissed timestamp if dismissed
        if (notification.changed('is_dismissed') && notification.is_dismissed && !notification.dismissed_at) {
          notification.dismissed_at = new Date();
        }

        // Update archived timestamp if archived
        if (notification.changed('is_archived') && notification.is_archived && !notification.archived_at) {
          notification.archived_at = new Date();
        }
      }
    }
  });

  // Instance methods
  Notification.prototype.markAsRead = async function() {
    return this.update({
      is_read: true,
      read_at: new Date()
    });
  };

  Notification.prototype.dismiss = async function() {
    return this.update({
      is_dismissed: true,
      dismissed_at: new Date()
    });
  };

  Notification.prototype.archive = async function() {
    return this.update({
      is_archived: true,
      archived_at: new Date()
    });
  };

  Notification.prototype.isExpired = function() {
    return this.expires_at && new Date() > this.expires_at;
  };

  Notification.prototype.canRetry = function() {
    return this.retry_count < this.max_retries;
  };

  Notification.prototype.incrementRetry = async function(errorMessage = null) {
    const updates = {
      retry_count: this.retry_count + 1,
      last_retry_at: new Date()
    };

    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    return this.update(updates);
  };

  Notification.prototype.markAsSent = async function(channel, status = 'sent', details = {}) {
    const deliveryStatus = { ...this.delivery_status };
    deliveryStatus[channel] = {
      status,
      sent_at: new Date(),
      ...details
    };

    const updates = { delivery_status: deliveryStatus };

    // If this is the first successful send, mark as sent
    if (!this.sent_at && status === 'sent') {
      updates.sent_at = new Date();
    }

    return this.update(updates);
  };

  Notification.prototype.updateDeliveryStatus = async function(channel, status, details = {}) {
    const deliveryStatus = { ...this.delivery_status };
    deliveryStatus[channel] = {
      ...deliveryStatus[channel],
      status,
      updated_at: new Date(),
      ...details
    };

    return this.update({ delivery_status: deliveryStatus });
  };

  Notification.prototype.addTag = async function(tag) {
    if (!this.tags.includes(tag)) {
      const tags = [...this.tags, tag];
      return this.update({ tags });
    }
    return this;
  };

  Notification.prototype.removeTag = async function(tag) {
    const tags = this.tags.filter(t => t !== tag);
    return this.update({ tags });
  };

  Notification.prototype.toSafeJSON = function() {
    const notification = this.toJSON();
    
    // Remove internal metadata
    if (notification.metadata && notification.metadata.internal) {
      delete notification.metadata.internal;
    }
    
    // Remove error details from public view
    if (notification.error_message) {
      delete notification.error_message;
    }
    
    return notification;
  };

  // Class methods
  Notification.findByUser = function(userId, options = {}) {
    const whereClause = { user_id: userId };
    
    if (options.unreadOnly) {
      whereClause.is_read = false;
    }
    
    if (options.type) {
      whereClause.type = options.type;
    }
    
    if (options.category) {
      whereClause.category = options.category;
    }

    return this.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: options.limit || 50
    });
  };

  Notification.getUnreadCount = function(userId) {
    return this.count({
      where: {
        user_id: userId,
        is_read: false,
        is_dismissed: false,
        is_archived: false
      }
    });
  };

  Notification.getPendingNotifications = function() {
    return this.findAll({
      where: {
        scheduled_at: {
          [sequelize.Op.lte]: new Date()
        },
        sent_at: null,
        is_archived: false
      },
      order: [['scheduled_at', 'ASC']]
    });
  };

  Notification.getFailedNotifications = function() {
    return this.findAll({
      where: {
        retry_count: {
          [sequelize.Op.gte]: sequelize.col('max_retries')
        },
        sent_at: null,
        is_archived: false
      },
      order: [['last_retry_at', 'DESC']]
    });
  };

  Notification.getExpiredNotifications = function() {
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

  Notification.getByType = function(type, limit = 100) {
    return this.findAll({
      where: { type },
      order: [['created_at', 'DESC']],
      limit
    });
  };

  Notification.getByPriority = function(priority, limit = 100) {
    return this.findAll({
      where: { priority },
      order: [['created_at', 'DESC']],
      limit
    });
  };

  Notification.getStatistics = async function(filters = {}) {
    const whereClause = { ...filters };
    
    const stats = await this.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN is_read = true THEN 1 END")), 'read'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN is_read = false THEN 1 END")), 'unread'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN sent_at IS NOT NULL THEN 1 END")), 'sent'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN sent_at IS NULL THEN 1 END")), 'pending'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN retry_count >= max_retries THEN 1 END")), 'failed']
      ],
      raw: true
    });

    return {
      total: parseInt(stats[0].total) || 0,
      read: parseInt(stats[0].read) || 0,
      unread: parseInt(stats[0].unread) || 0,
      sent: parseInt(stats[0].sent) || 0,
      pending: parseInt(stats[0].pending) || 0,
      failed: parseInt(stats[0].failed) || 0
    };
  };

  // Static method to create and schedule notification
  Notification.createNotification = async function(data) {
    const notification = await this.create({
      ...data,
      scheduled_at: data.scheduled_at || new Date()
    });

    // Queue for immediate processing if not scheduled for future
    if (!data.scheduled_at || data.scheduled_at <= new Date()) {
      // Queue notification job
      // This would integrate with your job queue service
    }

    return notification;
  };

  // Associations
  Notification.associate = function(models) {
    Notification.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Notification;
};