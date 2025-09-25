module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
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
        len: [2, 100],
        is: /^[a-z_]+$/i // Only letters and underscores
      }
    },
    display_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    action: {
      type: DataTypes.ENUM('create', 'read', 'update', 'delete', 'manage', 'execute'),
      allowNull: false
    },
    scope: {
      type: DataTypes.ENUM('own', 'department', 'district', 'state', 'all'),
      defaultValue: 'own'
    },
    is_system_permission: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'permissions',
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        fields: ['resource', 'action']
      },
      {
        fields: ['scope']
      },
      {
        fields: ['status']
      }
    ]
  });

  // Instance methods
  Permission.prototype.matches = function(resource, action, scope = null) {
    if (this.resource !== resource) return false;
    if (this.action !== action && this.action !== 'manage') return false;
    if (scope && this.scope !== scope && this.scope !== 'all') return false;
    return true;
  };

  // Class methods
  Permission.findByName = function(name) {
    return this.findOne({ where: { name } });
  };

  Permission.findByResource = function(resource) {
    return this.findAll({
      where: { resource },
      order: [['action', 'ASC']]
    });
  };

  Permission.getSystemPermissions = function() {
    return this.findAll({
      where: { is_system_permission: true },
      order: [['resource', 'ASC'], ['action', 'ASC']]
    });
  };

  Permission.getActivePermissions = function() {
    return this.findAll({
      where: { status: 'active' },
      order: [['resource', 'ASC'], ['action', 'ASC']]
    });
  };

  // Associations
  Permission.associate = function(models) {
    // Permission belongs to many roles through RolePermission
    Permission.belongsToMany(models.Role, {
      through: models.RolePermission,
      foreignKey: 'permission_id',
      otherKey: 'role_id',
      as: 'roles'
    });
  };

  return Permission;
};