const express = require('express');
const { body, query, param } = require('express-validator');
const {
  submitComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  getComplaintTimeline,
  getComplaintStatistics
} = require('../controllers/complaintController');

const { authenticateToken, requireVerifiedUser, officerOrAbove } = require('../middleware/auth');
const { validateInput, uploadRateLimit } = require('../middleware/security');

const router = express.Router();

// Validation rules
const submitComplaintValidation = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Description must be between 50 and 5000 characters'),
  body('complaint_type_id')
    .isUUID()
    .withMessage('Valid complaint type ID is required'),
  body('incident_date')
    .optional()
    .isISO8601()
    .withMessage('Incident date must be a valid date'),
  body('incident_location')
    .optional()
    .isObject()
    .withMessage('Incident location must be an object'),
  body('financial_loss')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Financial loss must be a positive number'),
  body('is_anonymous')
    .optional()
    .isBoolean()
    .withMessage('is_anonymous must be a boolean'),
  body('contact_preference')
    .optional()
    .isIn(['email', 'sms', 'phone', 'none'])
    .withMessage('Invalid contact preference')
];

const updateStatusValidation = [
  body('status')
    .isIn(['submitted', 'under_review', 'investigation', 'pending_info', 'action_taken', 'closed', 'rejected', 'appealed'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];

const getComplaintsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['submitted', 'under_review', 'investigation', 'pending_info', 'action_taken', 'closed', 'rejected', 'appealed'])
    .withMessage('Invalid status'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority'),
  query('complaint_type_id')
    .optional()
    .isUUID()
    .withMessage('Invalid complaint type ID'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters'),
  query('sort_by')
    .optional()
    .isIn(['created_at', 'updated_at', 'status', 'priority', 'sla_deadline'])
    .withMessage('Invalid sort field'),
  query('sort_order')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC'),
  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('date_from must be a valid date'),
  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('date_to must be a valid date')
];

const complaintIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid complaint ID')
];

/**
 * @route   POST /api/complaints
 * @desc    Submit a new complaint
 * @access  Private (Verified users only)
 */
router.post('/',
  authenticateToken,
  requireVerifiedUser,
  validateInput(submitComplaintValidation),
  submitComplaint
);

/**
 * @route   GET /api/complaints
 * @desc    Get complaints list with filtering and pagination
 * @access  Private
 */
router.get('/',
  authenticateToken,
  validateInput(getComplaintsValidation),
  getComplaints
);

/**
 * @route   GET /api/complaints/statistics
 * @desc    Get complaint statistics
 * @access  Private
 */
router.get('/statistics',
  authenticateToken,
  getComplaintStatistics
);

/**
 * @route   GET /api/complaints/:id
 * @desc    Get complaint details by ID
 * @access  Private
 */
router.get('/:id',
  authenticateToken,
  validateInput(complaintIdValidation),
  getComplaintById
);

/**
 * @route   PUT /api/complaints/:id/status
 * @desc    Update complaint status (officers only)
 * @access  Private (Officers and above)
 */
router.put('/:id/status',
  authenticateToken,
  officerOrAbove,
  validateInput([...complaintIdValidation, ...updateStatusValidation]),
  updateComplaintStatus
);

/**
 * @route   GET /api/complaints/:id/timeline
 * @desc    Get complaint timeline
 * @access  Private
 */
router.get('/:id/timeline',
  authenticateToken,
  validateInput(complaintIdValidation),
  getComplaintTimeline
);

/**
 * @route   POST /api/complaints/:id/evidence
 * @desc    Upload evidence for a complaint
 * @access  Private
 */
router.post('/:id/evidence',
  authenticateToken,
  uploadRateLimit,
  validateInput(complaintIdValidation),
  async (req, res) => {
    try {
      // This would be implemented with multer for file upload
      // For now, return a placeholder response
      res.json({
        success: true,
        message: 'Evidence upload endpoint - to be implemented with file upload middleware'
      });
    } catch (error) {
      console.error('Upload evidence error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload evidence'
      });
    }
  }
);

/**
 * @route   POST /api/complaints/:id/messages
 * @desc    Send a message related to a complaint
 * @access  Private
 */
router.post('/:id/messages',
  authenticateToken,
  validateInput([
    ...complaintIdValidation,
    body('subject')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Subject must be between 5 and 200 characters'),
    body('content')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Content must be between 10 and 2000 characters'),
    body('message_type')
      .optional()
      .isIn(['general', 'query', 'response', 'update', 'clarification'])
      .withMessage('Invalid message type'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority')
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { subject, content, message_type = 'general', priority = 'medium' } = req.body;

      // Verify complaint exists and user has access
      const { Complaint } = require('../models');
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

      // Create message (placeholder implementation)
      const { Message } = require('../models');
      const message = await Message.create({
        complaint_id: id,
        sender_id: req.user.id,
        subject,
        content,
        message_type,
        priority,
        status: 'sent'
      });

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: {
          message: message.toSafeJSON()
        }
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message'
      });
    }
  }
);

/**
 * @route   GET /api/complaints/:id/messages
 * @desc    Get messages for a complaint
 * @access  Private
 */
router.get('/:id/messages',
  authenticateToken,
  validateInput(complaintIdValidation),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Verify complaint exists and user has access
      const { Complaint, Message, User } = require('../models');
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

      // Get messages
      const messages = await Message.findAll({
        where: { complaint_id: id },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'first_name', 'last_name']
          }
        ],
        order: [['created_at', 'ASC']]
      });

      res.json({
        success: true,
        data: {
          messages: messages.map(message => message.toSafeJSON())
        }
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve messages'
      });
    }
  }
);

module.exports = router;