module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define('Feedback', {
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
    type: {
      type: DataTypes.ENUM(
        'resolution_feedback',
        'service_feedback',
        'officer_feedback',
        'system_feedback',
        'process_feedback',
        'general_feedback',
        'complaint_feedback',
        'suggestion',
        'other'
      ),
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [5, 200]
      }
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 2000]
      }
    },
    aspects: {
      type: DataTypes.JSONB,
      defaultValue: {},
      validate: {
        isValidAspects(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Aspects must be an object');
          }
          // Validate aspect ratings
          for (const [aspect, rating] of Object.entries(value)) {
            if (typeof rating !== 'number' || rating < 1 || rating > 5) {
              throw new Error(`Invalid rating for aspect ${aspect}: must be between 1 and 5`);
            }
          }
        }
      }
    },
    suggestions: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      }
    },
    is_anonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'acknowledged', 'acted_upon', 'closed'),
      defaultValue: 'pending'
    },
    reviewed_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    action_taken: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    follow_up_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    follow_up_date: {
      type: DataTypes.DATE,
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
    sentiment: {
      type: DataTypes.ENUM('very_negative', 'negative', 'neutral', 'positive', 'very_positive'),
      allowNull: true
    },
    sentiment_score: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: -1,
        max: 1
      }
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    category: {
      type: DataTypes.ENUM(
        'service_quality',
        'response_time',
        'communication',
        'resolution_quality',
        'staff_behavior',
        'system_usability',
        'process_efficiency',
        'transparency',
        'accessibility',
        'other'
      ),
      allowNull: true
    },
    source: {
      type: DataTypes.ENUM('web', 'mobile', 'email', 'phone', 'in_person', 'survey', 'other'),
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
    tableName: 'feedback',
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
        fields: ['type']
      },
      {
        fields: ['rating']
      },
      {
        fields: ['status']
      },
      {
        fields: ['reviewed_by']
      },
      {
        fields: ['is_anonymous']
      },
      {
        fields: ['is_public']
      },
      {
        fields: ['sentiment']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['category']
      },
      {
        fields: ['source']
      },
      {
        fields: ['follow_up_required']
      },
      {
        fields: ['follow_up_date']
      },
      {
        fields: ['created_at']
      }
    ],
    hooks: {
      beforeCreate: async (feedback) => {
        // Auto-detect sentiment based on rating
        if (!feedback.sentiment) {
          if (feedback.rating <= 2) {
            feedback.sentiment = feedback.rating === 1 ? 'very_negative' : 'negative';
          } else if (feedback.rating === 3) {
            feedback.sentiment = 'neutral';
          } else {
            feedback.sentiment = feedback.rating === 5 ? 'very_positive' : 'positive';
          }
        }

        // Set priority based on rating and type
        if (!feedback.priority) {
          if (feedback.rating <= 2 && feedback.type === 'resolution_feedback') {
            feedback.priority = 'high';
          } else if (feedback.rating <= 2) {
            feedback.priority = 'medium';
          } else {
            feedback.priority = 'low';
          }
        }
      },
      beforeUpdate: async (feedback) => {
        // Update reviewed timestamp if status changed to reviewed
        if (feedback.changed('status') && feedback.status === 'reviewed' && !feedback.reviewed_at) {
          feedback.reviewed_at = new Date();
        }
      }
    }
  });

  // Instance methods
  Feedback.prototype.calculateOverallRating = function() {
    if (!this.aspects || Object.keys(this.aspects).length === 0) {
      return this.rating;
    }

    const aspectRatings = Object.values(this.aspects);
    const aspectAverage = aspectRatings.reduce((sum, rating) => sum + rating, 0) / aspectRatings.length;
    
    // Weight: 70% main rating, 30% aspect average
    return Math.round((this.rating * 0.7 + aspectAverage * 0.3) * 10) / 10;
  };

  Feedback.prototype.markAsReviewed = async function(reviewerId, response = null) {
    const updates = {
      status: 'reviewed',
      reviewed_by: reviewerId,
      reviewed_at: new Date()
    };

    if (response) {
      updates.response = response;
    }

    return this.update(updates);
  };

  Feedback.prototype.acknowledge = async function(reviewerId, response = null) {
    const updates = {
      status: 'acknowledged',
      reviewed_by: reviewerId,
      reviewed_at: new Date()
    };

    if (response) {
      updates.response = response;
    }

    return this.update(updates);
  };

  Feedback.prototype.recordAction = async function(actionTaken, reviewerId = null) {
    const updates = {
      status: 'acted_upon',
      action_taken: actionTaken
    };

    if (reviewerId) {
      updates.reviewed_by = reviewerId;
      if (!this.reviewed_at) {
        updates.reviewed_at = new Date();
      }
    }

    return this.update(updates);
  };

  Feedback.prototype.scheduleFollowUp = async function(followUpDate) {
    return this.update({
      follow_up_required: true,
      follow_up_date: followUpDate
    });
  };

  Feedback.prototype.addTag = async function(tag) {
    if (!this.tags.includes(tag)) {
      const tags = [...this.tags, tag];
      return this.update({ tags });
    }
    return this;
  };

  Feedback.prototype.removeTag = async function(tag) {
    const tags = this.tags.filter(t => t !== tag);
    return this.update({ tags });
  };

  Feedback.prototype.updateSentiment = async function(sentiment, score = null) {
    const updates = { sentiment };
    if (score !== null) {
      updates.sentiment_score = score;
    }
    return this.update(updates);
  };

  Feedback.prototype.isOverdue = function() {
    return this.follow_up_required && this.follow_up_date && new Date() > this.follow_up_date;
  };

  Feedback.prototype.canBeViewedBy = function(user) {
    // Public feedback can be viewed by anyone
    if (this.is_public) return true;
    
    // User can view their own feedback
    if (this.user_id === user.id) return true;
    
    // Officers and admins can view all feedback
    return user.hasRole(['officer', 'admin', 'super_admin']);
  };

  Feedback.prototype.toSafeJSON = function() {
    const feedback = this.toJSON();
    
    // Remove sensitive information for anonymous feedback
    if (this.is_anonymous) {
      delete feedback.user_id;
      delete feedback.ip_address;
      delete feedback.user_agent;
    }
    
    // Remove internal metadata
    if (feedback.metadata && feedback.metadata.internal) {
      delete feedback.metadata.internal;
    }
    
    return feedback;
  };

  // Class methods
  Feedback.findByComplaint = function(complaintId) {
    return this.findAll({
      where: { complaint_id: complaintId },
      order: [['created_at', 'DESC']]
    });
  };

  Feedback.findByApplication = function(applicationId) {
    return this.findAll({
      where: { application_id: applicationId },
      order: [['created_at', 'DESC']]
    });
  };

  Feedback.findByUser = function(userId) {
    return this.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });
  };

  Feedback.getByRating = function(rating) {
    return this.findAll({
      where: { rating },
      order: [['created_at', 'DESC']]
    });
  };

  Feedback.getLowRatings = function(threshold = 2) {
    return this.findAll({
      where: {
        rating: { [sequelize.Op.lte]: threshold }
      },
      order: [['created_at', 'DESC']]
    });
  };

  Feedback.getHighRatings = function(threshold = 4) {
    return this.findAll({
      where: {
        rating: { [sequelize.Op.gte]: threshold }
      },
      order: [['created_at', 'DESC']]
    });
  };

  Feedback.getPendingReview = function() {
    return this.findAll({
      where: { status: 'pending' },
      order: [['created_at', 'ASC']]
    });
  };

  Feedback.getOverdueFeedback = function() {
    return this.findAll({
      where: {
        follow_up_required: true,
        follow_up_date: { [sequelize.Op.lt]: new Date() },
        status: { [sequelize.Op.notIn]: ['closed'] }
      },
      order: [['follow_up_date', 'ASC']]
    });
  };

  Feedback.getBySentiment = function(sentiment) {
    return this.findAll({
      where: { sentiment },
      order: [['created_at', 'DESC']]
    });
  };

  Feedback.getByCategory = function(category) {
    return this.findAll({
      where: { category },
      order: [['created_at', 'DESC']]
    });
  };

  Feedback.getPublicFeedback = function(limit = 50) {
    return this.findAll({
      where: { is_public: true },
      order: [['created_at', 'DESC']],
      limit
    });
  };

  Feedback.getStatistics = async function(filters = {}) {
    const whereClause = { ...filters };
    
    const stats = await this.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN rating <= 2 THEN 1 END")), 'low_ratings'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN rating >= 4 THEN 1 END")), 'high_ratings'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN status = 'pending' THEN 1 END")), 'pending_review'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN follow_up_required = true AND follow_up_date < NOW() THEN 1 END")), 'overdue_followups']
      ],
      raw: true
    });

    const sentimentStats = await this.findAll({
      where: whereClause,
      attributes: [
        'sentiment',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['sentiment'],
      raw: true
    });

    const sentimentBreakdown = {};
    sentimentStats.forEach(stat => {
      if (stat.sentiment) {
        sentimentBreakdown[stat.sentiment] = parseInt(stat.count);
      }
    });

    return {
      total: parseInt(stats[0].total) || 0,
      average_rating: parseFloat(stats[0].average_rating) || 0,
      low_ratings: parseInt(stats[0].low_ratings) || 0,
      high_ratings: parseInt(stats[0].high_ratings) || 0,
      pending_review: parseInt(stats[0].pending_review) || 0,
      overdue_followups: parseInt(stats[0].overdue_followups) || 0,
      sentiment_breakdown: sentimentBreakdown
    };
  };

  // Associations
  Feedback.associate = function(models) {
    Feedback.belongsTo(models.Complaint, {
      foreignKey: 'complaint_id',
      as: 'complaint'
    });

    Feedback.belongsTo(models.Application, {
      foreignKey: 'application_id',
      as: 'application'
    });

    Feedback.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    Feedback.belongsTo(models.User, {
      foreignKey: 'reviewed_by',
      as: 'reviewer'
    });
  };

  return Feedback;
};