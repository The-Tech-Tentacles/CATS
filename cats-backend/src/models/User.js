const bcrypt = require('bcryptjs');
const { encrypt, decrypt } = require('../utils/encryption');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[+]?[1-9][\d]{9,14}$/
      }
    },
    phone_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    aadhaar_number: {
      type: DataTypes.TEXT, // Encrypted
      allowNull: true
    },
    pan_number: {
      type: DataTypes.TEXT, // Encrypted
      allowNull: true
    },
    address: {
      type: DataTypes.JSONB,
      allowNull: true,
      validate: {
        isValidAddress(value) {
          if (value && typeof value === 'object') {
            const required = ['street', 'city', 'state', 'pincode'];
            const missing = required.filter(field => !value[field]);
            if (missing.length > 0) {
              throw new Error(`Missing address fields: ${missing.join(', ')}`);
            }
          }
        }
      }
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
      allowNull: true
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profile_picture: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending_verification'),
      defaultValue: 'pending_verification'
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true
    },
    password_reset_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    email_verification_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone_verification_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    two_factor_secret: {
      type: DataTypes.TEXT, // Encrypted
      allowNull: true
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        notifications: {
          email: true,
          sms: true,
          push: true
        },
        language: 'en',
        timezone: 'Asia/Kolkata'
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'users',
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['phone_number']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      }
    ],
    hooks: {
      beforeCreate: async (user) => {
        // Hash password
        if (user.password_hash) {
          const salt = await bcrypt.genSalt(12);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
        
        // Encrypt sensitive fields
        if (user.aadhaar_number) {
          user.aadhaar_number = encrypt(user.aadhaar_number);
        }
        if (user.pan_number) {
          user.pan_number = encrypt(user.pan_number);
        }
        if (user.two_factor_secret) {
          user.two_factor_secret = encrypt(user.two_factor_secret);
        }
      },
      beforeUpdate: async (user) => {
        // Hash password if changed
        if (user.changed('password_hash')) {
          const salt = await bcrypt.genSalt(12);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
        
        // Encrypt sensitive fields if changed
        if (user.changed('aadhaar_number') && user.aadhaar_number) {
          user.aadhaar_number = encrypt(user.aadhaar_number);
        }
        if (user.changed('pan_number') && user.pan_number) {
          user.pan_number = encrypt(user.pan_number);
        }
        if (user.changed('two_factor_secret') && user.two_factor_secret) {
          user.two_factor_secret = encrypt(user.two_factor_secret);
        }
      }
    }
  });

  // Instance methods
  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password_hash);
  };

  User.prototype.getDecryptedAadhaar = function() {
    return this.aadhaar_number ? decrypt(this.aadhaar_number) : null;
  };

  User.prototype.getDecryptedPAN = function() {
    return this.pan_number ? decrypt(this.pan_number) : null;
  };

  User.prototype.getDecryptedTwoFactorSecret = function() {
    return this.two_factor_secret ? decrypt(this.two_factor_secret) : null;
  };

  User.prototype.toSafeJSON = function() {
    const user = this.toJSON();
    delete user.password_hash;
    delete user.aadhaar_number;
    delete user.pan_number;
    delete user.two_factor_secret;
    delete user.password_reset_token;
    delete user.email_verification_token;
    delete user.phone_verification_token;
    return user;
  };

  User.prototype.isLocked = function() {
    return this.locked_until && this.locked_until > new Date();
  };

  User.prototype.incrementLoginAttempts = async function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.locked_until && this.locked_until < new Date()) {
      return this.update({
        login_attempts: 1,
        locked_until: null
      });
    }
    
    const updates = { login_attempts: this.login_attempts + 1 };
    
    // Lock account after 5 failed attempts
    if (this.login_attempts + 1 >= 5) {
      updates.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }
    
    return this.update(updates);
  };

  User.prototype.resetLoginAttempts = function() {
    return this.update({
      login_attempts: 0,
      locked_until: null
    });
  };

  // Class methods
  User.findByEmail = function(email) {
    return this.findOne({ where: { email: email.toLowerCase() } });
  };

  User.findByPhone = function(phone) {
    return this.findOne({ where: { phone_number: phone } });
  };

  // Associations
  User.associate = function(models) {
    // User has many roles through UserRole
    User.belongsToMany(models.Role, {
      through: models.UserRole,
      foreignKey: 'user_id',
      otherKey: 'role_id',
      as: 'roles'
    });

    // User has many complaints
    User.hasMany(models.Complaint, {
      foreignKey: 'complainant_id',
      as: 'complaints'
    });

    // User has many applications
    User.hasMany(models.Application, {
      foreignKey: 'applicant_id',
      as: 'applications'
    });

    // User has many officer assignments
    User.hasMany(models.OfficerAssignment, {
      foreignKey: 'officer_id',
      as: 'assignments'
    });

    // User has many messages sent
    User.hasMany(models.Message, {
      foreignKey: 'sender_id',
      as: 'sent_messages'
    });

    // User has many messages received
    User.hasMany(models.Message, {
      foreignKey: 'recipient_id',
      as: 'received_messages'
    });

    // User has many notifications
    User.hasMany(models.Notification, {
      foreignKey: 'user_id',
      as: 'notifications'
    });

    // User has many audit logs
    User.hasMany(models.AuditLog, {
      foreignKey: 'user_id',
      as: 'audit_logs'
    });

    // User has many feedbacks
    User.hasMany(models.Feedback, {
      foreignKey: 'user_id',
      as: 'feedbacks'
    });

    // User has many appeals
    User.hasMany(models.Appeal, {
      foreignKey: 'appellant_id',
      as: 'appeals'
    });
  };

  return User;
};