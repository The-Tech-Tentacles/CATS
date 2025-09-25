const { Complaint, ComplaintType, User, Evidence, CaseTimeline, AuditLog } = require('../models');
const { validateComplaintData } = require('../utils/validation');
const { logBusiness, logDataAccess } = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Submit a new complaint
 */
const submitComplaint = async (req, res) => {
  try {
    // Validate input data
    const validation = validateComplaintData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const complaintData = validation.data;

    // Verify complaint type exists
    const complaintType = await ComplaintType.findByPk(complaintData.complaint_type_id);
    if (!complaintType || !complaintType.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive complaint type'
      });
    }

    // Check if anonymous complaint is allowed for this type
    if (complaintData.is_anonymous && !complaintType.allows_anonymous) {
      return res.status(400).json({
        success: false,
        message: 'Anonymous complaints are not allowed for this complaint type'
      });
    }

    // Set complainant ID (null for anonymous complaints)
    const complainantId = complaintData.is_anonymous ? null : req.user.id;

    // Calculate SLA deadline
    const slaDeadline = complaintType.getSLADeadline();

    // Create complaint
    const complaint = await Complaint.create({
      ...complaintData,
      complainant_id: complainantId,
      priority: complaintType.severity_level,
      severity: complaintType.severity_level,
      sla_deadline: slaDeadline,
      submitted_at: new Date(),
      status: 'submitted'
    });

    // Create initial timeline entry
    await CaseTimeline.create({
      complaint_id: complaint.id,
      user_id: complainantId || null,
      action: 'submitted',
      title: 'Complaint Submitted',
      description: 'Complaint has been submitted successfully',
      is_milestone: true,
      milestone_type: 'submission',
      visibility: 'public'
    });

    // Log complaint submission
    await AuditLog.create({
      user_id: complainantId,
      action: 'create',
      resource_type: 'complaint',
      resource_id: complaint.id,
      resource_identifier: complaint.complaint_number,
      description: 'Complaint submitted successfully',
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      metadata: {
        complaint_type: complaintType.name,
        is_anonymous: complaintData.is_anonymous,
        priority: complaint.priority
      }
    });

    logBusiness('complaint_submitted', 'complaint', complaint.id, {
      complaint_number: complaint.complaint_number,
      complaint_type: complaintType.name,
      is_anonymous: complaintData.is_anonymous,
      user_id: complainantId
    });

    // TODO: Send confirmation notification
    // await sendComplaintConfirmation(complaint, complainantId);

    // TODO: Auto-assign if rules exist
    // await autoAssignComplaint(complaint);

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: {
        complaint: {
          id: complaint.id,
          complaint_number: complaint.complaint_number,
          status: complaint.status,
          submitted_at: complaint.submitted_at,
          sla_deadline: complaint.sla_deadline
        }
      }
    });
  } catch (error) {
    console.error('Submit complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit complaint'
    });
  }
};

/**
 * Get complaints list with filtering and pagination
 */
const getComplaints = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      complaint_type_id,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC',
      date_from,
      date_to
    } = req.query;

    // Build where clause
    const whereClause = {};

    // User can only see their own complaints unless they're an officer/admin
    const userRoles = req.user.roles.map(role => role.name);
    const isOfficerOrAbove = userRoles.some(role => ['officer', 'admin', 'super_admin'].includes(role));

    if (!isOfficerOrAbove) {
      whereClause.complainant_id = req.user.id;
    }

    // Apply filters
    if (status) {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    if (complaint_type_id) {
      whereClause.complaint_type_id = complaint_type_id;
    }

    if (search) {
      whereClause[Op.or] = [
        { complaint_number: { [Op.iLike]: `%${search}%` } },
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) {
        whereClause.created_at[Op.gte] = new Date(date_from);
      }
      if (date_to) {
        whereClause.created_at[Op.lte] = new Date(date_to);
      }
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get complaints with related data
    const { count, rows: complaints } = await Complaint.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: ComplaintType,
          as: 'complaint_type',
          attributes: ['id', 'name', 'display_name', 'category']
        },
        {
          model: User,
          as: 'complainant',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false
        }
      ],
      order: [[sort_by, sort_order.toUpperCase()]],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    // Log data access
    logDataAccess(req.user.id, 'complaint', 'list', null, {
      filters: { status, priority, complaint_type_id, search },
      count: complaints.length
    });

    res.json({
      success: true,
      data: {
        complaints: complaints.map(complaint => complaint.toSafeJSON()),
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / parseInt(limit)),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaints'
    });
  }
};

/**
 * Get complaint details by ID
 */
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByPk(id, {
      include: [
        {
          model: ComplaintType,
          as: 'complaint_type'
        },
        {
          model: User,
          as: 'complainant',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false
        },
        {
          model: Evidence,
          as: 'evidence',
          attributes: ['id', 'file_name', 'file_type', 'file_size', 'category', 'created_at']
        },
        {
          model: CaseTimeline,
          as: 'timeline',
          where: { visibility: 'public' },
          required: false,
          order: [['created_at', 'ASC']]
        }
      ]
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check access permissions
    const userRoles = req.user.roles.map(role => role.name);
    const isOfficerOrAbove = userRoles.some(role => ['officer', 'admin', 'super_admin'].includes(role));
    const isComplainant = complaint.complainant_id === req.user.id;

    if (!isOfficerOrAbove && !isComplainant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Increment view count
    await complaint.incrementViews();

    // Log data access
    logDataAccess(req.user.id, 'complaint', 'read', complaint.id, {
      complaint_number: complaint.complaint_number,
      access_type: isComplainant ? 'owner' : 'officer'
    });

    res.json({
      success: true,
      data: {
        complaint: complaint.toSafeJSON()
      }
    });
  } catch (error) {
    console.error('Get complaint by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaint'
    });
  }
};

/**
 * Update complaint status (officers only)
 */
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = [
      'submitted', 'under_review', 'investigation', 'pending_info',
      'action_taken', 'closed', 'rejected', 'appealed'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    const oldStatus = complaint.status;

    // Update complaint status
    await complaint.update({ status });

    // Create timeline entry
    await CaseTimeline.create({
      complaint_id: complaint.id,
      user_id: req.user.id,
      action: 'status_changed',
      title: `Status Changed to ${status.replace('_', ' ').toUpperCase()}`,
      description: notes || `Complaint status updated from ${oldStatus} to ${status}`,
      previous_value: { status: oldStatus },
      new_value: { status },
      field_changed: 'status',
      is_milestone: ['under_review', 'investigation', 'action_taken', 'closed'].includes(status),
      milestone_type: status === 'closed' ? 'closure' : status === 'investigation' ? 'investigation_start' : null,
      visibility: 'public'
    });

    // Log status update
    await AuditLog.create({
      user_id: req.user.id,
      action: 'update',
      resource_type: 'complaint',
      resource_id: complaint.id,
      resource_identifier: complaint.complaint_number,
      description: `Complaint status updated from ${oldStatus} to ${status}`,
      old_values: { status: oldStatus },
      new_values: { status },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    logBusiness('complaint_status_updated', 'complaint', complaint.id, {
      complaint_number: complaint.complaint_number,
      old_status: oldStatus,
      new_status: status,
      updated_by: req.user.id
    });

    // TODO: Send status update notification
    // await sendStatusUpdateNotification(complaint, status);

    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      data: {
        complaint: {
          id: complaint.id,
          complaint_number: complaint.complaint_number,
          status: complaint.status,
          updated_at: complaint.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint status'
    });
  }
};

/**
 * Get complaint timeline
 */
const getComplaintTimeline = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check access permissions
    const userRoles = req.user.roles.map(role => role.name);
    const isOfficerOrAbove = userRoles.some(role => ['officer', 'admin', 'super_admin'].includes(role));
    const isComplainant = complaint.complainant_id === req.user.id;

    if (!isOfficerOrAbove && !isComplainant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Determine visibility based on user role
    const visibilityFilter = isOfficerOrAbove ? ['public', 'internal'] : ['public'];

    const timeline = await CaseTimeline.findAll({
      where: {
        complaint_id: id,
        visibility: { [Op.in]: visibilityFilter }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name'],
          required: false
        }
      ],
      order: [['created_at', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        timeline: timeline.map(entry => entry.toSafeJSON())
      }
    });
  } catch (error) {
    console.error('Get complaint timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaint timeline'
    });
  }
};

/**
 * Get complaint statistics
 */
const getComplaintStatistics = async (req, res) => {
  try {
    const userRoles = req.user.roles.map(role => role.name);
    const isOfficerOrAbove = userRoles.some(role => ['officer', 'admin', 'super_admin'].includes(role));

    let whereClause = {};
    
    // Regular users can only see their own complaint statistics
    if (!isOfficerOrAbove) {
      whereClause.complainant_id = req.user.id;
    }

    const stats = await Complaint.getStatistics(whereClause);

    res.json({
      success: true,
      data: {
        statistics: stats
      }
    });
  } catch (error) {
    console.error('Get complaint statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaint statistics'
    });
  }
};

module.exports = {
  submitComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  getComplaintTimeline,
  getComplaintStatistics
};