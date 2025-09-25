module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
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
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    assigned_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'user_roles',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'role_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['role_id']
      },
      {
        fields: ['assigned_by']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['expires_at']
      }
    ]
  });

  // Instance methods
  UserRole.prototype.isExpired = function() {
    return this.expires_at && this.expires_at < new Date();
  };

  UserRole.prototype.isValid = function() {
    return this.is_active && !this.isExpired();
  };

  // Class methods
  UserRole.getActiveRoles = function(userId) {
    return this.findAll({
      where: {
        user_id: userId,
        is_active: true,
        [sequelize.Op.or]: [
          { expires_at: null },
          { expires_at: { [sequelize.Op.gt]: new Date() } }
        ]
      },
      include: [{
        model: sequelize.models.Role,
        as: 'role',
        where: { status: 'active' }
      }]
    });
  };

  // Associations
  UserRole.associate = function(models) {
    UserRole.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    UserRole.belongsTo(models.Role, {
      foreignKey: 'role_id',
      as: 'role'
    });

    UserRole.belongsTo(models.User, {
      foreignKey: 'assigned_by',
      as: 'assigner'
    });
  };

  return UserRole;
};