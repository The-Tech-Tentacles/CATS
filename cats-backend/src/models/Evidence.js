const crypto = require('crypto');
const path = require('path');

module.exports = (sequelize, DataTypes) => {
  const Evidence = sequelize.define('Evidence', {
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
    uploaded_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255]
      }
    },
    original_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 255]
      }
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_size: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    file_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    mime_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    file_extension: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 10]
      }
    },
    file_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [64, 64] // SHA-256 hash
      }
    },
    checksum: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [32, 32] // MD5 checksum
      }
    },
    category: {
      type: DataTypes.ENUM(
        'screenshot',
        'document',
        'video',
        'audio',
        'image',
        'log_file',
        'certificate',
        'identity_proof',
        'address_proof',
        'financial_document',
        'communication_record',
        'other'
      ),
      allowNull: false
    },
    description: {
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
    is_sensitive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_encrypted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    access_level: {
      type: DataTypes.ENUM('public', 'restricted', 'confidential', 'secret'),
      defaultValue: 'restricted'
    },
    virus_scan_status: {
      type: DataTypes.ENUM('pending', 'clean', 'infected', 'failed', 'skipped'),
      defaultValue: 'pending'
    },
    virus_scan_result: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    virus_scanned_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    chain_of_custody: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Chain of custody must be an array');
          }
        }
      }
    },
    download_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    last_accessed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_accessed_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
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
    is_archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    archived_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    archive_location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    thumbnail_path: {
      type: DataTypes.STRING,
      allowNull: true
    },
    preview_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    ocr_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ocr_confidence: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100
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
    },
    upload_ip: {
      type: DataTypes.INET,
      allowNull: true
    },
    upload_user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'evidence',
    indexes: [
      {
        fields: ['complaint_id']
      },
      {
        fields: ['application_id']
      },
      {
        fields: ['uploaded_by']
      },
      {
        unique: true,
        fields: ['file_hash']
      },
      {
        fields: ['file_type']
      },
      {
        fields: ['category']
      },
      {
        fields: ['is_sensitive']
      },
      {
        fields: ['access_level']
      },
      {
        fields: ['virus_scan_status']
      },
      {
        fields: ['is_archived']
      },
      {
        fields: ['expires_at']
      },
      {
        fields: ['created_at']
      }
    ],
    hooks: {
      beforeCreate: async (evidence) => {
        // Add initial chain of custody entry
        evidence.chain_of_custody = [{
          action: 'uploaded',
          user_id: evidence.uploaded_by,
          timestamp: new Date(),
          ip_address: evidence.upload_ip,
          user_agent: evidence.upload_user_agent
        }];

        // Set file extension if not provided
        if (!evidence.file_extension && evidence.original_name) {
          evidence.file_extension = path.extname(evidence.original_name).toLowerCase().substring(1);
        }

        // Set expiration date if retention period is specified
        if (evidence.retention_period && !evidence.expires_at) {
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + evidence.retention_period);
          evidence.expires_at = expirationDate;
        }
      }
    }
  });

  // Instance methods
  Evidence.prototype.addChainOfCustodyEntry = async function(action, userId, additionalData = {}) {
    const entry = {
      action,
      user_id: userId,
      timestamp: new Date(),
      ...additionalData
    };

    const chainOfCustody = [...this.chain_of_custody, entry];
    return this.update({ chain_of_custody: chainOfCustody });
  };

  Evidence.prototype.recordAccess = async function(userId) {
    const updates = {
      download_count: this.download_count + 1,
      last_accessed_at: new Date(),
      last_accessed_by: userId
    };

    await this.addChainOfCustodyEntry('accessed', userId);
    return this.update(updates);
  };

  Evidence.prototype.isExpired = function() {
    return this.expires_at && new Date() > this.expires_at;
  };

  Evidence.prototype.isVirusSafe = function() {
    return this.virus_scan_status === 'clean' || this.virus_scan_status === 'skipped';
  };

  Evidence.prototype.canBeAccessedBy = function(user) {
    // Check access level permissions
    switch (this.access_level) {
      case 'public':
        return true;
      case 'restricted':
        // User must be related to the complaint/application or have officer role
        return this.uploaded_by === user.id || user.hasRole(['officer', 'admin', 'super_admin']);
      case 'confidential':
        // Only officers and above
        return user.hasRole(['officer', 'admin', 'super_admin']);
      case 'secret':
        // Only admins and above
        return user.hasRole(['admin', 'super_admin']);
      default:
        return false;
    }
  };

  Evidence.prototype.generateSecureUrl = function(expiresInMinutes = 60) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    
    // Store the token in metadata for verification
    const metadata = { ...this.metadata };
    if (!metadata.secure_tokens) metadata.secure_tokens = [];
    
    metadata.secure_tokens.push({
      token,
      expires_at: expiresAt,
      created_at: new Date()
    });

    // Clean up expired tokens
    metadata.secure_tokens = metadata.secure_tokens.filter(
      t => new Date(t.expires_at) > new Date()
    );

    this.update({ metadata });

    return {
      url: `/api/evidence/${this.id}/download?token=${token}`,
      expires_at: expiresAt
    };
  };

  Evidence.prototype.verifySecureToken = function(token) {
    if (!this.metadata.secure_tokens) return false;
    
    const tokenData = this.metadata.secure_tokens.find(t => t.token === token);
    if (!tokenData) return false;
    
    return new Date(tokenData.expires_at) > new Date();
  };

  Evidence.prototype.archive = async function(archiveLocation) {
    return this.update({
      is_archived: true,
      archived_at: new Date(),
      archive_location: archiveLocation
    });
  };

  Evidence.prototype.addTag = async function(tag) {
    if (!this.tags.includes(tag)) {
      const tags = [...this.tags, tag];
      return this.update({ tags });
    }
    return this;
  };

  Evidence.prototype.removeTag = async function(tag) {
    const tags = this.tags.filter(t => t !== tag);
    return this.update({ tags });
  };

  Evidence.prototype.toSafeJSON = function() {
    const evidence = this.toJSON();
    
    // Remove sensitive file system information
    delete evidence.file_path;
    delete evidence.archive_location;
    delete evidence.upload_ip;
    delete evidence.upload_user_agent;
    
    // Remove internal metadata
    if (evidence.metadata && evidence.metadata.secure_tokens) {
      delete evidence.metadata.secure_tokens;
    }
    
    return evidence;
  };

  // Class methods
  Evidence.findByHash = function(hash) {
    return this.findOne({ where: { file_hash: hash } });
  };

  Evidence.findByComplaint = function(complaintId) {
    return this.findAll({
      where: { complaint_id: complaintId },
      order: [['created_at', 'ASC']]
    });
  };

  Evidence.findByApplication = function(applicationId) {
    return this.findAll({
      where: { application_id: applicationId },
      order: [['created_at', 'ASC']]
    });
  };

  Evidence.getExpiredFiles = function() {
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

  Evidence.getPendingVirusScan = function() {
    return this.findAll({
      where: {
        virus_scan_status: 'pending'
      },
      order: [['created_at', 'ASC']]
    });
  };

  Evidence.getByCategory = function(category) {
    return this.findAll({
      where: { category },
      order: [['created_at', 'DESC']]
    });
  };

  Evidence.getStatistics = async function(filters = {}) {
    const whereClause = { ...filters };
    
    const stats = await this.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.col('file_size')), 'total_size'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN virus_scan_status = 'clean' THEN 1 END")), 'clean_files'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN virus_scan_status = 'infected' THEN 1 END")), 'infected_files'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN is_archived = true THEN 1 END")), 'archived_files'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN expires_at < NOW() THEN 1 END")), 'expired_files']
      ],
      raw: true
    });

    return {
      total: parseInt(stats[0].total) || 0,
      total_size: parseInt(stats[0].total_size) || 0,
      clean_files: parseInt(stats[0].clean_files) || 0,
      infected_files: parseInt(stats[0].infected_files) || 0,
      archived_files: parseInt(stats[0].archived_files) || 0,
      expired_files: parseInt(stats[0].expired_files) || 0
    };
  };

  // Associations
  Evidence.associate = function(models) {
    Evidence.belongsTo(models.Complaint, {
      foreignKey: 'complaint_id',
      as: 'complaint'
    });

    Evidence.belongsTo(models.Application, {
      foreignKey: 'application_id',
      as: 'application'
    });

    Evidence.belongsTo(models.User, {
      foreignKey: 'uploaded_by',
      as: 'uploader'
    });

    Evidence.belongsTo(models.User, {
      foreignKey: 'last_accessed_by',
      as: 'last_accessor'
    });
  };

  return Evidence;
};