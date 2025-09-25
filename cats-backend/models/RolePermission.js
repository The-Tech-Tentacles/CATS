module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define('RolePermission', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    permission_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id'
      }
    },
    granted_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    granted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    conditions: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'role_permissions',
    indexes: [
      {
        unique: true,
        fields: ['role_id', 'permission_id']
      },
      {
        fields: ['role_id']
      },
      {
        fields: ['permission_id']
      },
      {
        fields: ['granted_by']
      }
    ]
  });

  // Associations
  RolePermission.associate = function(models) {
    RolePermission.belongsTo(models.Role, {
      foreignKey: 'role_id',
      as: 'role'
    });

    RolePermission.belongsTo(models.Permission, {
      foreignKey: 'permission_id',
      as: 'permission'
    });

    RolePermission.belongsTo(models.User, {
      foreignKey: 'granted_by',
      as: 'granter'
    });
  };

  return RolePermission;
};