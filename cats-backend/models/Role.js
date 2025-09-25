module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
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
        len: [2, 50],
        isAlphanumeric: true
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
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 10
      }
    },
    is_system_role: {
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
    tableName: 'roles',
    indexes: [
      {
        unique: true,
        fields: ['name']
      },
      {
        fields: ['level']
      },
      {
        fields: ['status']
      }
    ]
  });

  // Instance methods
  Role.prototype.hasPermission = async function(permissionName) {
    const models = require('./index');
    const permission = await models.Permission.findOne({
      where: { name: permissionName }
    });
    
    if (!permission) return false;
    
    const rolePermission = await models.RolePermission.findOne({
      where: {
        role_id: this.id,
        permission_id: permission.id
      }
    });
    
    return !!rolePermission;
  };

  Role.prototype.addPermission = async function(permissionName) {
    const models = require('./index');
    const permission = await models.Permission.findOne({
      where: { name: permissionName }
    });
    
    if (!permission) {
      throw new Error(`Permission '${permissionName}' not found`);
    }
    
    const [rolePermission, created] = await models.RolePermission.findOrCreate({
      where: {
        role_id: this.id,
        permission_id: permission.id
      }
    });
    
    return { rolePermission, created };
  };

  Role.prototype.removePermission = async function(permissionName) {
    const models = require('./index');
    const permission = await models.Permission.findOne({
      where: { name: permissionName }
    });
    
    if (!permission) return false;
    
    const deleted = await models.RolePermission.destroy({
      where: {
        role_id: this.id,
        permission_id: permission.id
      }
    });
    
    return deleted > 0;
  };

  // Class methods
  Role.findByName = function(name) {
    return this.findOne({ where: { name } });
  };

  Role.getSystemRoles = function() {
    return this.findAll({
      where: { is_system_role: true },
      order: [['level', 'ASC']]
    });
  };

  Role.getActiveRoles = function() {
    return this.findAll({
      where: { status: 'active' },
      order: [['level', 'ASC']]
    });
  };

  // Associations
  Role.associate = function(models) {
    // Role belongs to many users through UserRole
    Role.belongsToMany(models.User, {
      through: models.UserRole,
      foreignKey: 'role_id',
      otherKey: 'user_id',
      as: 'users'
    });

    // Role has many permissions through RolePermission
    Role.belongsToMany(models.Permission, {
      through: models.RolePermission,
      foreignKey: 'role_id',
      otherKey: 'permission_id',
      as: 'permissions'
    });
  };

  return Role;
};