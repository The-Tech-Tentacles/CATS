const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const UserRole = require('./UserRole');
const ComplaintType = require('./ComplaintType');
const Complaint = require('./Complaint');
const Application = require('./Application');
const Evidence = require('./Evidence');
const CaseTimeline = require('./CaseTimeline');
const Message = require('./Message');
const AuditLog = require('./AuditLog');
const Notification = require('./Notification');
const SLARule = require('./SLARule');
const Feedback = require('./Feedback');
const Appeal = require('./Appeal');
const OfficerAssignment = require('./OfficerAssignment');
const SystemSetting = require('./SystemSetting');

// Initialize models
const models = {
  User: User(sequelize, Sequelize.DataTypes),
  Role: Role(sequelize, Sequelize.DataTypes),
  Permission: Permission(sequelize, Sequelize.DataTypes),
  RolePermission: RolePermission(sequelize, Sequelize.DataTypes),
  UserRole: UserRole(sequelize, Sequelize.DataTypes),
  ComplaintType: ComplaintType(sequelize, Sequelize.DataTypes),
  Complaint: Complaint(sequelize, Sequelize.DataTypes),
  Application: Application(sequelize, Sequelize.DataTypes),
  Evidence: Evidence(sequelize, Sequelize.DataTypes),
  CaseTimeline: CaseTimeline(sequelize, Sequelize.DataTypes),
  Message: Message(sequelize, Sequelize.DataTypes),
  AuditLog: AuditLog(sequelize, Sequelize.DataTypes),
  Notification: Notification(sequelize, Sequelize.DataTypes),
  SLARule: SLARule(sequelize, Sequelize.DataTypes),
  Feedback: Feedback(sequelize, Sequelize.DataTypes),
  Appeal: Appeal(sequelize, Sequelize.DataTypes),
  OfficerAssignment: OfficerAssignment(sequelize, Sequelize.DataTypes),
  SystemSetting: SystemSetting(sequelize, Sequelize.DataTypes)
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Add sequelize instance and Sequelize constructor to models object
models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;