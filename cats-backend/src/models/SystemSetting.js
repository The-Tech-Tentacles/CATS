module.exports = (sequelize, DataTypes) => {
  const SystemSetting = sequelize.define('SystemSetting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 100],
        is: /^[a-z_][a-z0-9_]*$/i // Valid identifier format
      }
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    data_type: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'object', 'array'),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM(
        'system',
        'security',
        'notification',
        'sla',
        'workflow',
        'integration',
        'ui',
        'reporting',
        'backup',
        'maintenance',
        'compliance',
        'performance',
        'other'
      ),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    default_value: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    validation_rules: {
      type: DataTypes.JSONB,
      defaultValue: {},
      validate: {
        isValidRules(value) {
          if (value && typeof value !== 'object') {
            throw new Error('Validation rules must be an object');
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
    is_system_setting: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_user_configurable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    requires_restart: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    access_level: {
      type: DataTypes.ENUM('public', 'user', 'admin', 'super_admin', 'system'),
      defaultValue: 'admin'
    },
    environment: {
      type: DataTypes.ENUM('all', 'development', 'staging', 'production'),
      defaultValue: 'all'
    },
    version: {
      type: DataTypes.STRING,
      defaultValue: '1.0.0',
      validate: {
        is: /^\d+\.\d+\.\d+$/
      }
    },
    last_modified_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    last_modified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    effective_from: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    effective_until: {
      type: DataTypes.DATE,
      allowNull: true
    },
    change_history: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Change history must be an array');
          }
        }
      }
    },
    dependencies: {
      type: DataTypes.JSONB,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Dependencies must be an array');
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
      defaultValue: {}
    }
  }, {
    tableName: 'system_settings',
    indexes: [
      {
        unique: true,
        fields: ['key']
      },
      {
        fields: ['category']
      },
      {
        fields: ['data_type']
      },
      {
        fields: ['is_sensitive']
      },
      {
        fields: ['is_system_setting']
      },
      {
        fields: ['is_user_configurable']
      },
      {
        fields: ['access_level']
      },
      {
        fields: ['environment']
      },
      {
        fields: ['effective_from']
      },
      {
        fields: ['effective_until']
      },
      {
        fields: ['last_modified_by']
      }
    ],
    hooks: {
      beforeUpdate: async (setting) => {
        // Record change in history
        if (setting.changed('value')) {
          const changeHistory = [...setting.change_history];
          changeHistory.push({
            old_value: setting._previousDataValues.value,
            new_value: setting.value,
            changed_by: setting.last_modified_by,
            changed_at: new Date(),
            reason: setting.metadata?.change_reason || 'Updated'
          });
          
          // Keep only last 10 changes
          if (changeHistory.length > 10) {
            changeHistory.splice(0, changeHistory.length - 10);
          }
          
          setting.change_history = changeHistory;
          setting.last_modified_at = new Date();
        }
      }
    }
  });

  // Instance methods
  SystemSetting.prototype.getValue = function() {
    // Return the actual value, handling encryption if needed
    if (this.is_encrypted && this.value) {
      // Decrypt value if encrypted
      const { decrypt } = require('../utils/encryption');
      return decrypt(this.value);
    }
    return this.value;
  };

  SystemSetting.prototype.setValue = async function(newValue, changedBy = null, reason = null) {
    let processedValue = newValue;
    
    // Validate the value
    if (!this.validateValue(newValue)) {
      throw new Error(`Invalid value for setting ${this.key}`);
    }
    
    // Encrypt if needed
    if (this.is_encrypted) {
      const { encrypt } = require('../utils/encryption');
      processedValue = encrypt(JSON.stringify(newValue));
    }
    
    const updates = {
      value: processedValue,
      last_modified_by: changedBy,
      last_modified_at: new Date()
    };
    
    if (reason) {
      updates.metadata = {
        ...this.metadata,
        change_reason: reason
      };
    }
    
    return this.update(updates);
  };

  SystemSetting.prototype.validateValue = function(value) {
    // Type validation
    const expectedType = this.data_type;
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    
    if (expectedType !== actualType && !(expectedType === 'object' && actualType === 'object')) {
      return false;
    }
    
    // Custom validation rules
    if (this.validation_rules && Object.keys(this.validation_rules).length > 0) {
      return this.applyValidationRules(value);
    }
    
    return true;
  };

  SystemSetting.prototype.applyValidationRules = function(value) {
    const rules = this.validation_rules;
    
    // Required validation
    if (rules.required && (value === null || value === undefined || value === '')) {
      return false;
    }
    
    // String validations
    if (this.data_type === 'string' && typeof value === 'string') {
      if (rules.min_length && value.length < rules.min_length) return false;
      if (rules.max_length && value.length > rules.max_length) return false;
      if (rules.pattern && !new RegExp(rules.pattern).test(value)) return false;
      if (rules.enum && !rules.enum.includes(value)) return false;
    }
    
    // Number validations
    if (this.data_type === 'number' && typeof value === 'number') {
      if (rules.min && value < rules.min) return false;
      if (rules.max && value > rules.max) return false;
      if (rules.integer && !Number.isInteger(value)) return false;
    }
    
    // Array validations
    if (this.data_type === 'array' && Array.isArray(value)) {
      if (rules.min_items && value.length < rules.min_items) return false;
      if (rules.max_items && value.length > rules.max_items) return false;
      if (rules.unique && new Set(value).size !== value.length) return false;
    }
    
    return true;
  };

  SystemSetting.prototype.resetToDefault = async function(changedBy = null) {
    if (this.default_value !== null) {
      return this.setValue(this.default_value, changedBy, 'Reset to default');
    }
    throw new Error(`No default value defined for setting ${this.key}`);
  };

  SystemSetting.prototype.isEffective = function(date = new Date()) {
    if (this.effective_from && date < this.effective_from) return false;
    if (this.effective_until && date > this.effective_until) return false;
    return true;
  };

  SystemSetting.prototype.canBeAccessedBy = function(user) {
    switch (this.access_level) {
      case 'public':
        return true;
      case 'user':
        return !!user;
      case 'admin':
        return user && user.hasRole(['admin', 'super_admin']);
      case 'super_admin':
        return user && user.hasRole(['super_admin']);
      case 'system':
        return false; // Only system can access
      default:
        return false;
    }
  };

  SystemSetting.prototype.canBeModifiedBy = function(user) {
    if (!this.is_user_configurable) return false;
    if (this.is_system_setting) return user && user.hasRole(['super_admin']);
    return this.canBeAccessedBy(user);
  };

  SystemSetting.prototype.addTag = async function(tag) {
    if (!this.tags.includes(tag)) {
      const tags = [...this.tags, tag];
      return this.update({ tags });
    }
    return this;
  };

  SystemSetting.prototype.removeTag = async function(tag) {
    const tags = this.tags.filter(t => t !== tag);
    return this.update({ tags });
  };

  SystemSetting.prototype.toSafeJSON = function() {
    const setting = this.toJSON();
    
    // Remove sensitive values
    if (this.is_sensitive) {
      setting.value = '[HIDDEN]';
    }
    
    // Remove encrypted values from public view
    if (this.is_encrypted) {
      setting.value = '[ENCRYPTED]';
    }
    
    return setting;
  };

  // Class methods
  SystemSetting.findByKey = function(key) {
    return this.findOne({ where: { key } });
  };

  SystemSetting.getByCategory = function(category) {
    return this.findAll({
      where: { category },
      order: [['key', 'ASC']]
    });
  };

  SystemSetting.getEffectiveSettings = function(date = new Date()) {
    return this.findAll({
      where: {
        effective_from: { [sequelize.Op.lte]: date },
        [sequelize.Op.or]: [
          { effective_until: null },
          { effective_until: { [sequelize.Op.gte]: date } }
        ]
      },
      order: [['category', 'ASC'], ['key', 'ASC']]
    });
  };

  SystemSetting.getUserConfigurableSettings = function() {
    return this.findAll({
      where: { is_user_configurable: true },
      order: [['category', 'ASC'], ['key', 'ASC']]
    });
  };

  SystemSetting.getSystemSettings = function() {
    return this.findAll({
      where: { is_system_setting: true },
      order: [['key', 'ASC']]
    });
  };

  SystemSetting.getSensitiveSettings = function() {
    return this.findAll({
      where: { is_sensitive: true },
      order: [['key', 'ASC']]
    });
  };

  SystemSetting.getSettingsByAccess = function(accessLevel) {
    return this.findAll({
      where: { access_level: accessLevel },
      order: [['category', 'ASC'], ['key', 'ASC']]
    });
  };

  SystemSetting.getSettingsByEnvironment = function(environment) {
    return this.findAll({
      where: {
        [sequelize.Op.or]: [
          { environment: 'all' },
          { environment }
        ]
      },
      order: [['category', 'ASC'], ['key', 'ASC']]
    });
  };

  SystemSetting.bulkUpdate = async function(settings, changedBy = null) {
    const results = [];
    
    for (const [key, value] of Object.entries(settings)) {
      const setting = await this.findByKey(key);
      if (setting && setting.canBeModifiedBy({ hasRole: () => true })) { // Simplified check
        try {
          await setting.setValue(value, changedBy, 'Bulk update');
          results.push({ key, status: 'success' });
        } catch (error) {
          results.push({ key, status: 'error', error: error.message });
        }
      } else {
        results.push({ key, status: 'error', error: 'Setting not found or not modifiable' });
      }
    }
    
    return results;
  };

  SystemSetting.exportSettings = function(category = null, includeSystem = false) {
    const whereClause = {};
    
    if (category) whereClause.category = category;
    if (!includeSystem) whereClause.is_system_setting = false;
    
    return this.findAll({
      where: whereClause,
      attributes: ['key', 'value', 'data_type', 'category', 'description'],
      order: [['category', 'ASC'], ['key', 'ASC']]
    });
  };

  SystemSetting.importSettings = async function(settingsData, changedBy = null) {
    const results = [];
    
    for (const settingData of settingsData) {
      try {
        const [setting, created] = await this.findOrCreate({
          where: { key: settingData.key },
          defaults: {
            ...settingData,
            last_modified_by: changedBy,
            last_modified_at: new Date()
          }
        });
        
        if (!created) {
          await setting.setValue(settingData.value, changedBy, 'Import');
        }
        
        results.push({ key: settingData.key, status: created ? 'created' : 'updated' });
      } catch (error) {
        results.push({ key: settingData.key, status: 'error', error: error.message });
      }
    }
    
    return results;
  };

  // Associations
  SystemSetting.associate = function(models) {
    SystemSetting.belongsTo(models.User, {
      foreignKey: 'last_modified_by',
      as: 'modifier'
    });
  };

  return SystemSetting;
};