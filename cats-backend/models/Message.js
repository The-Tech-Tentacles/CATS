const { encrypt, decrypt } = require('../utils/encryption');

module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
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
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    recipient_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    message_type: {
      type: DataTypes.ENUM(
        'general',
        'query',
        'response',
        'update',
        'clarification',
        'document_request',
        'status_update',
        'escalation',
        'resolution',
        'feedback_request',
        'system_notification',
        'reminder',
        'warning',
        'approval',
        'rejection',
        'other'
      ),
      defaultValue: 'general'
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 200]
      }
    },
    content: {
      type: DataTypes.TEXT, // Encrypted
      allowNull: false,
      validate: {
        len: [1, 10000]
      }
    },
    content_type: {
      type: DataTypes.ENUM('text', 'html', 'markdown'),
      defaultValue: 'text'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    visibility: {
      type: DataTypes.ENUM('public', 'private', 'internal'),
      defaultValue: 'public'
    },
    is_automated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_encrypted: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_sensitive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    requires_response: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    response_deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    parent_message_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'messages',
        key: 'id'
      }
    },
    thread_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'sent', 'delivered', 'read', 'replied', 'archived'),
      defaultValue: 'sent'
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    replied_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    archived_at: {
      type: DataTypes.DATE,
      allowNull: true
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
    notification_channels: {
      type: DataTypes.JSONB,
      defaultValue: ['in_app'],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Notification channels must be an array');
          }
        }
      }
    },
    source: {
      type: DataTypes.ENUM('web', 'mobile', 'email', 'sms', 'system', 'api', 'other'),
      defaultValue: 'web'
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
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
    tableName: 'messages',
    indexes: [
      {
        fields: ['complaint_id']
      },
      {
        fields: ['application_id']
      },
      {
        fields: ['sender_id']
      },
      {
        fields: ['recipient_id']
      },
      {
        fields: ['message_type']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['visibility']
      },
      {
        fields: ['status']
      },
      {
        fields: ['parent_message_id']
      },
      {
        fields: ['thread_id']
      },
      {
        fields: ['is_automated']
      },
      {
        fields: ['is_sensitive']
      },
      {
        fields: ['requires_response']
      },
      {
        fields: ['response_deadline']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['read_at']
      }
    ],
    hooks: {
      beforeCreate: async (message) => {
        // Encrypt content if encryption is enabled
        if (message.is_encrypted && message.content) {
          message.content = encrypt(message.content);
        }

        // Set thread_id if this is a root message
        if (!message.parent_message_id && !message.thread_id) {
          message.thread_id = message.id || DataTypes.UUIDV4();
        }

        // If this is a reply, inherit thread_id from parent
        if (message.parent_message_id) {
          const parentMessage = await sequelize.models.Message.findByPk(message.parent_message_id);
          if (parentMessage) {
            message.thread_id = parentMessage.thread_id;
          }
        }
      },
      beforeUpdate: async (message) => {
        // Encrypt content if changed and encryption is enabled
        if (message.changed('content') && message.is_encrypted && message.content) {
          message.content = encrypt(message.content);
        }

        // Update read timestamp if status changed to read
        if (message.changed('status') && message.status === 'read' && !message.read_at) {
          message.read_at = new Date();
        }

        // Update replied timestamp if status changed to replied
        if (message.changed('status') && message.status === 'replied' && !message.replied_at) {
          message.replied_at = new Date();
        }

        // Update archived timestamp if status changed to archived
        if (message.changed('status') && message.status === 'archived' && !message.archived_at) {
          message.archived_at = new Date();
        }
      }
    }
  });

  // Instance methods
  Message.prototype.getDecryptedContent = function() {
    if (!this.is_encrypted) return this.content;
    return this.content ? decrypt(this.content) : null;
  };

  Message.prototype.markAsRead = async function(userId = null) {
    const updates = {
      status: 'read',
      read_at: new Date()
    };

    if (userId) {
      const metadata = { ...this.metadata };
      metadata.read_by = userId;
      updates.metadata = metadata;
    }

    return this.update(updates);
  };

  Message.prototype.markAsReplied = async function() {
    return this.update({
      status: 'replied',
      replied_at: new Date()
    });
  };

  Message.prototype.archive = async function() {
    return this.update({
      status: 'archived',
      archived_at: new Date()
    });
  };

  Message.prototype.isOverdue = function() {
    return this.response_deadline && new Date() > this.response_deadline;
  };

  Message.prototype.canBeViewedBy = function(user) {
    // Check visibility level
    if (this.visibility === 'internal') {
      return user.hasRole(['officer', 'admin', 'super_admin']);
    }
    
    if (this.visibility === 'private') {
      // Only sender and recipient can view private messages
      return this.sender_id === user.id || this.recipient_id === user.id;
    }
    
    // Public messages can be viewed by case participants
    return this.isParticipant(user);
  };

  Message.prototype.isParticipant = function(user) {
    // Check if user is sender or recipient
    if (this.sender_id === user.id || this.recipient_id === user.id) {
      return true;
    }
    
    // Check if user is related to the complaint/application
    // This would need to be implemented based on case relationships
    return false;
  };

  Message.prototype.addAttachment = async function(attachment) {
    const attachments = [...this.attachments, attachment];
    return this.update({ attachments });
  };

  Message.prototype.removeAttachment = async function(attachmentId) {
    const attachments = this.attachments.filter(a => a.id !== attachmentId);
    return this.update({ attachments });
  };

  Message.prototype.addTag = async function(tag) {
    if (!this.tags.includes(tag)) {
      const tags = [...this.tags, tag];
      return this.update({ tags });
    }
    return this;
  };

  Message.prototype.removeTag = async function(tag) {
    const tags = this.tags.filter(t => t !== tag);
    return this.update({ tags });
  };

  Message.prototype.updateDeliveryStatus = async function(channel, status, details = {}) {
    const deliveryStatus = { ...this.delivery_status };
    deliveryStatus[channel] = {
      status,
      timestamp: new Date(),
      ...details
    };
    return this.update({ delivery_status: deliveryStatus });
  };

  Message.prototype.toSafeJSON = function() {
    const message = this.toJSON();
    
    // Replace encrypted content with decrypted version
    if (this.is_encrypted) {
      message.content = this.getDecryptedContent();
    }
    
    // Remove sensitive information
    delete message.ip_address;
    delete message.user_agent;
    
    // Remove internal metadata
    if (message.metadata && message.metadata.internal) {
      delete message.metadata.internal;
    }
    
    return message;
  };

  // Class methods
  Message.findByComplaint = function(complaintId, visibility = ['public']) {
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

  Message.findByApplication = function(applicationId, visibility = ['public']) {
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

  Message.findByThread = function(threadId) {
    return this.findAll({
      where: { thread_id: threadId },
      order: [['created_at', 'ASC']]
    });
  };

  Message.findBySender = function(senderId) {
    return this.findAll({
      where: { sender_id: senderId },
      order: [['created_at', 'DESC']]
    });
  };

  Message.findByRecipient = function(recipientId) {
    return this.findAll({
      where: { recipient_id: recipientId },
      order: [['created_at', 'DESC']]
    });
  };

  Message.getUnreadMessages = function(userId) {
    return this.findAll({
      where: {
        recipient_id: userId,
        status: {
          [sequelize.Op.notIn]: ['read', 'archived']
        }
      },
      order: [['created_at', 'DESC']]
    });
  };

  Message.getOverdueResponses = function() {
    return this.findAll({
      where: {
        requires_response: true,
        response_deadline: {
          [sequelize.Op.lt]: new Date()
        },
        status: {
          [sequelize.Op.notIn]: ['replied', 'archived']
        }
      },
      order: [['response_deadline', 'ASC']]
    });
  };

  Message.getByPriority = function(priority) {
    return this.findAll({
      where: { priority },
      order: [['created_at', 'DESC']]
    });
  };

  Message.getStatistics = async function(filters = {}) {
    const whereClause = { ...filters };
    
    const stats = await this.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'read' THEN 1 END")), 'read'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'sent' THEN 1 END")), 'unread'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN requires_response = true THEN 1 END")), 'requiring_response'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN requires_response = true AND response_deadline < NOW() AND status NOT IN ('replied', 'archived') THEN 1 END")), 'overdue_responses'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN is_automated = true THEN 1 END")), 'automated']
      ],
      raw: true
    });

    return {
      total: parseInt(stats[0].total) || 0,
      read: parseInt(stats[0].read) || 0,
      unread: parseInt(stats[0].unread) || 0,
      requiring_response: parseInt(stats[0].requiring_response) || 0,
      overdue_responses: parseInt(stats[0].overdue_responses) || 0,
      automated: parseInt(stats[0].automated) || 0
    };
  };

  // Associations
  Message.associate = function(models) {
    Message.belongsTo(models.Complaint, {
      foreignKey: 'complaint_id',
      as: 'complaint'
    });

    Message.belongsTo(models.Application, {
      foreignKey: 'application_id',
      as: 'application'
    });

    Message.belongsTo(models.User, {
      foreignKey: 'sender_id',
      as: 'sender'
    });

    Message.belongsTo(models.User, {
      foreignKey: 'recipient_id',
      as: 'recipient'
    });

    Message.belongsTo(models.Message, {
      foreignKey: 'parent_message_id',
      as: 'parent_message'
    });

    Message.hasMany(models.Message, {
      foreignKey: 'parent_message_id',
      as: 'replies'
    });
  };

  return Message;
};