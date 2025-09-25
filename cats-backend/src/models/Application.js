module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define(
    "Application",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      application_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      applicant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      type: {
        type: DataTypes.ENUM(
          "noc_cyber_clearance",
          "character_verification",
          "cyber_security_audit",
          "digital_forensics",
          "awareness_program",
          "training_request",
          "consultation",
          "other"
        ),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [10, 200],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [50, 2000],
        },
      },
      purpose: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [20, 1000],
        },
      },
      organization_name: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [2, 200],
        },
      },
      organization_type: {
        type: DataTypes.ENUM(
          "government",
          "private_company",
          "ngo",
          "educational",
          "individual",
          "other"
        ),
        allowNull: true,
      },
      contact_person: {
        type: DataTypes.JSONB,
        allowNull: true,
        validate: {
          isValidContact(value) {
            if (value && typeof value === "object") {
              const required = ["name", "designation", "phone", "email"];
              const missing = required.filter((field) => !value[field]);
              if (missing.length > 0) {
                throw new Error(
                  `Missing contact person fields: ${missing.join(", ")}`
                );
              }
            }
          },
        },
      },
      address: {
        type: DataTypes.JSONB,
        allowNull: false,
        validate: {
          isValidAddress(value) {
            if (value && typeof value === "object") {
              const required = ["street", "city", "state", "pincode"];
              const missing = required.filter((field) => !value[field]);
              if (missing.length > 0) {
                throw new Error(
                  `Missing address fields: ${missing.join(", ")}`
                );
              }
            }
          },
        },
      },
      requested_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      urgency_level: {
        type: DataTypes.ENUM("low", "medium", "high", "urgent"),
        defaultValue: "medium",
      },
      status: {
        type: DataTypes.ENUM(
          "draft",
          "submitted",
          "under_review",
          "documents_required",
          "processing",
          "approved",
          "rejected",
          "completed",
          "cancelled"
        ),
        defaultValue: "submitted",
      },
      priority: {
        type: DataTypes.ENUM("low", "medium", "high", "critical"),
        defaultValue: "medium",
      },
      form_data: {
        type: DataTypes.JSONB,
        defaultValue: {},
        validate: {
          isValidFormData(value) {
            if (value && typeof value !== "object") {
              throw new Error("Form data must be an object");
            }
          },
        },
      },
      required_documents: {
        type: DataTypes.JSONB,
        defaultValue: [],
        validate: {
          isArray(value) {
            if (!Array.isArray(value)) {
              throw new Error("Required documents must be an array");
            }
          },
        },
      },
      submitted_documents: {
        type: DataTypes.JSONB,
        defaultValue: [],
        validate: {
          isArray(value) {
            if (!Array.isArray(value)) {
              throw new Error("Submitted documents must be an array");
            }
          },
        },
      },
      fee_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      fee_status: {
        type: DataTypes.ENUM(
          "not_applicable",
          "pending",
          "paid",
          "waived",
          "refunded"
        ),
        defaultValue: "not_applicable",
      },
      payment_reference: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      processing_fee_paid_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      submitted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      acknowledged_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      assigned_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      processing_started_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rejected_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      sla_deadline: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      approval_details: {
        type: DataTypes.JSONB,
        allowNull: true,
        validate: {
          isValidApproval(value) {
            if (value && typeof value !== "object") {
              throw new Error("Approval details must be an object");
            }
          },
        },
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      conditions: {
        type: DataTypes.JSONB,
        defaultValue: [],
        validate: {
          isArray(value) {
            if (!Array.isArray(value)) {
              throw new Error("Conditions must be an array");
            }
          },
        },
      },
      validity_period: {
        type: DataTypes.JSONB,
        allowNull: true,
        validate: {
          isValidPeriod(value) {
            if (value && typeof value === "object") {
              if (!value.from || !value.to) {
                throw new Error("Validity period must have from and to dates");
              }
            }
          },
        },
      },
      certificate_number: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      certificate_issued_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      certificate_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      renewal_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      renewal_reminder_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      internal_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      external_reference: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tags: {
        type: DataTypes.JSONB,
        defaultValue: [],
        validate: {
          isArray(value) {
            if (!Array.isArray(value)) {
              throw new Error("Tags must be an array");
            }
          },
        },
      },
      statistics: {
        type: DataTypes.JSONB,
        defaultValue: {
          views: 0,
          updates: 0,
          messages: 0,
          document_uploads: 0,
        },
      },
      metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
    },
    {
      tableName: "applications",
      indexes: [
        {
          unique: true,
          fields: ["application_number"],
        },
        {
          unique: true,
          fields: ["certificate_number"],
          where: {
            certificate_number: {
              [sequelize.Sequelize.Op.ne]: null,
            },
          },
        },
        {
          fields: ["applicant_id"],
        },
        {
          fields: ["type"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["priority"],
        },
        {
          fields: ["urgency_level"],
        },
        {
          fields: ["submitted_at"],
        },
        {
          fields: ["sla_deadline"],
        },
        {
          fields: ["fee_status"],
        },
        {
          fields: ["certificate_expires_at"],
        },
        {
          fields: ["renewal_required"],
        },
        {
          fields: ["created_at"],
        },
      ],
      hooks: {
        beforeCreate: async (application) => {
          // Generate application number
          if (!application.application_number) {
            const year = new Date().getFullYear();
            const month = String(new Date().getMonth() + 1).padStart(2, "0");
            const typePrefix = application.type.toUpperCase().substring(0, 3);
            const count = await sequelize.models.Application.count({
              where: {
                type: application.type,
                created_at: {
                  [sequelize.Op.gte]: new Date(year, 0, 1),
                  [sequelize.Op.lt]: new Date(year + 1, 0, 1),
                },
              },
            });
            application.application_number = `${typePrefix}${year}${month}${String(
              count + 1
            ).padStart(5, "0")}`;
          }

          // Set submitted_at if status is submitted
          if (application.status === "submitted" && !application.submitted_at) {
            application.submitted_at = new Date();
          }
        },
        beforeUpdate: async (application) => {
          // Update timestamps based on status changes
          if (application.changed("status")) {
            const now = new Date();
            switch (application.status) {
              case "submitted":
                if (!application.submitted_at) application.submitted_at = now;
                break;
              case "under_review":
                if (!application.acknowledged_at)
                  application.acknowledged_at = now;
                break;
              case "processing":
                if (!application.processing_started_at)
                  application.processing_started_at = now;
                break;
              case "approved":
                if (!application.approved_at) application.approved_at = now;
                if (!application.completed_at) application.completed_at = now;
                break;
              case "rejected":
                if (!application.rejected_at) application.rejected_at = now;
                if (!application.completed_at) application.completed_at = now;
                break;
              case "completed":
                if (!application.completed_at) application.completed_at = now;
                break;
            }
          }

          // Generate certificate number for approved applications
          if (
            application.changed("status") &&
            application.status === "approved" &&
            !application.certificate_number
          ) {
            const year = new Date().getFullYear();
            const typeCode = application.type
              .toUpperCase()
              .replace(/_/g, "")
              .substring(0, 4);
            const count = await sequelize.models.Application.count({
              where: {
                status: "approved",
                certificate_number: {
                  [sequelize.Op.ne]: null,
                },
                created_at: {
                  [sequelize.Op.gte]: new Date(year, 0, 1),
                  [sequelize.Op.lt]: new Date(year + 1, 0, 1),
                },
              },
            });
            application.certificate_number = `CERT/${typeCode}/${year}/${String(
              count + 1
            ).padStart(4, "0")}`;
            application.certificate_issued_at = new Date();
          }
        },
      },
    }
  );

  // Instance methods
  Application.prototype.isOverdue = function () {
    return this.sla_deadline && new Date() > this.sla_deadline;
  };

  Application.prototype.getTimeRemaining = function () {
    if (!this.sla_deadline) return null;

    const now = new Date();
    const remaining = this.sla_deadline - now;

    if (remaining <= 0) return { overdue: true, hours: 0, minutes: 0 };

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    return { overdue: false, hours, minutes };
  };

  Application.prototype.isExpiringSoon = function (daysThreshold = 30) {
    if (!this.certificate_expires_at) return false;

    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);

    return this.certificate_expires_at <= threshold;
  };

  Application.prototype.isExpired = function () {
    return (
      this.certificate_expires_at && new Date() > this.certificate_expires_at
    );
  };

  Application.prototype.canBeUpdatedBy = function (user) {
    // Applicant can update their own application
    if (this.applicant_id === user.id) return true;

    // Officers and admins can update assigned applications
    // This would need to check user roles and assignments
    return false;
  };

  Application.prototype.incrementViews = async function () {
    const stats = { ...this.statistics };
    stats.views = (stats.views || 0) + 1;
    return this.update({ statistics: stats });
  };

  Application.prototype.incrementUpdates = async function () {
    const stats = { ...this.statistics };
    stats.updates = (stats.updates || 0) + 1;
    return this.update({ statistics: stats });
  };

  Application.prototype.addTag = async function (tag) {
    if (!this.tags.includes(tag)) {
      const tags = [...this.tags, tag];
      return this.update({ tags });
    }
    return this;
  };

  Application.prototype.removeTag = async function (tag) {
    const tags = this.tags.filter((t) => t !== tag);
    return this.update({ tags });
  };

  Application.prototype.approve = async function (
    approvalDetails,
    conditions = [],
    validityPeriod = null
  ) {
    const updates = {
      status: "approved",
      approval_details: approvalDetails,
      conditions,
      validity_period: validityPeriod,
    };

    if (validityPeriod && validityPeriod.to) {
      updates.certificate_expires_at = new Date(validityPeriod.to);
    }

    return this.update(updates);
  };

  Application.prototype.reject = async function (reason) {
    return this.update({
      status: "rejected",
      rejection_reason: reason,
    });
  };

  Application.prototype.toSafeJSON = function () {
    const application = this.toJSON();

    // Remove internal notes from public view
    delete application.internal_notes;

    // Remove sensitive metadata
    if (application.metadata && application.metadata.internal) {
      delete application.metadata.internal;
    }

    return application;
  };

  // Class methods
  Application.findByNumber = function (applicationNumber) {
    return this.findOne({ where: { application_number: applicationNumber } });
  };

  Application.findByCertificateNumber = function (certificateNumber) {
    return this.findOne({ where: { certificate_number: certificateNumber } });
  };

  Application.getOverdueApplications = function () {
    return this.findAll({
      where: {
        sla_deadline: {
          [sequelize.Op.lt]: new Date(),
        },
        status: {
          [sequelize.Op.notIn]: [
            "completed",
            "approved",
            "rejected",
            "cancelled",
          ],
        },
      },
      order: [["sla_deadline", "ASC"]],
    });
  };

  Application.getExpiringCertificates = function (daysThreshold = 30) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);

    return this.findAll({
      where: {
        certificate_expires_at: {
          [sequelize.Op.lte]: threshold,
          [sequelize.Op.gt]: new Date(),
        },
        status: "approved",
      },
      order: [["certificate_expires_at", "ASC"]],
    });
  };

  Application.getByStatus = function (status) {
    return this.findAll({
      where: { status },
      order: [["created_at", "DESC"]],
    });
  };

  Application.getByApplicant = function (applicantId) {
    return this.findAll({
      where: { applicant_id: applicantId },
      order: [["created_at", "DESC"]],
    });
  };

  Application.getByType = function (type) {
    return this.findAll({
      where: { type },
      order: [["created_at", "DESC"]],
    });
  };

  Application.getStatistics = async function (filters = {}) {
    const whereClause = { ...filters };

    const stats = await this.findAll({
      where: whereClause,
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "total"],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal("CASE WHEN status = 'approved' THEN 1 END")
          ),
          "approved",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal("CASE WHEN status = 'rejected' THEN 1 END")
          ),
          "rejected",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal("CASE WHEN status = 'processing' THEN 1 END")
          ),
          "processing",
        ],
        [
          sequelize.fn(
            "COUNT",
            sequelize.literal(
              "CASE WHEN sla_deadline < NOW() AND status NOT IN ('completed', 'approved', 'rejected', 'cancelled') THEN 1 END"
            )
          ),
          "overdue",
        ],
        [
          sequelize.fn(
            "AVG",
            sequelize.literal(
              "CASE WHEN status IN ('approved', 'rejected') AND completed_at IS NOT NULL THEN EXTRACT(EPOCH FROM (completed_at - submitted_at))/3600 END"
            )
          ),
          "avg_processing_hours",
        ],
      ],
      raw: true,
    });

    return {
      total: parseInt(stats[0].total) || 0,
      approved: parseInt(stats[0].approved) || 0,
      rejected: parseInt(stats[0].rejected) || 0,
      processing: parseInt(stats[0].processing) || 0,
      overdue: parseInt(stats[0].overdue) || 0,
      average_processing_time: parseFloat(stats[0].avg_processing_hours) || 0,
    };
  };

  // Associations
  Application.associate = function (models) {
    Application.belongsTo(models.User, {
      foreignKey: "applicant_id",
      as: "applicant",
    });

    Application.hasMany(models.Evidence, {
      foreignKey: "application_id",
      as: "documents",
    });

    Application.hasMany(models.CaseTimeline, {
      foreignKey: "application_id",
      as: "timeline",
    });

    Application.hasMany(models.Message, {
      foreignKey: "application_id",
      as: "messages",
    });

    Application.hasMany(models.OfficerAssignment, {
      foreignKey: "application_id",
      as: "assignments",
    });

    Application.hasMany(models.Feedback, {
      foreignKey: "application_id",
      as: "feedback",
    });

    Application.hasMany(models.Notification, {
      foreignKey: "related_id",
      as: "notifications",
      scope: {
        related_type: "application",
      },
    });
  };

  return Application;
};
