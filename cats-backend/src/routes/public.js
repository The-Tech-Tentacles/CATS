const express = require('express');
const { ComplaintType } = require('../models');
const { optionalAuth } = require('../middleware/auth');
const { authRateLimit } = require('../middleware/security');

const router = express.Router();

/**
 * @route   GET /api/public/complaint-types
 * @desc    Get public complaint types
 * @access  Public
 */
router.get('/complaint-types', async (req, res) => {
  try {
    const complaintTypes = await ComplaintType.getPublicTypes();
    
    res.json({
      success: true,
      data: {
        complaint_types: complaintTypes.map(type => ({
          id: type.id,
          name: type.name,
          display_name: type.display_name,
          description: type.description,
          category: type.category,
          severity_level: type.severity_level,
          sla_hours: type.sla_hours,
          allows_anonymous: type.allows_anonymous,
          required_fields: type.required_fields,
          form_schema: type.form_schema
        }))
      }
    });
  } catch (error) {
    console.error('Get complaint types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaint types'
    });
  }
});

/**
 * @route   GET /api/public/statistics
 * @desc    Get public statistics
 * @access  Public
 */
router.get('/statistics', async (req, res) => {
  try {
    // Get basic public statistics
    const { Complaint, Application } = require('../models');
    
    const complaintStats = await Complaint.getStatistics();
    const applicationStats = await Application.getStatistics();
    
    // Only return non-sensitive statistics
    const publicStats = {
      complaints: {
        total: complaintStats.total,
        closed: complaintStats.closed,
        average_resolution_time: Math.round(complaintStats.average_resolution_time)
      },
      applications: {
        total: applicationStats.total,
        approved: applicationStats.approved,
        average_processing_time: Math.round(applicationStats.average_processing_time)
      },
      last_updated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: {
        statistics: publicStats
      }
    });
  } catch (error) {
    console.error('Get public statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics'
    });
  }
});

/**
 * @route   POST /api/public/anonymous-complaint
 * @desc    Submit anonymous complaint
 * @access  Public
 */
router.post('/anonymous-complaint', authRateLimit, (req, res) => {
  res.json({
    success: true,
    message: 'Anonymous complaint submission endpoint - to be implemented'
  });
});

/**
 * @route   GET /api/public/complaint-status/:number
 * @desc    Check complaint status by number (public)
 * @access  Public
 */
router.get('/complaint-status/:number', async (req, res) => {
  try {
    const { number } = req.params;
    
    const { Complaint } = require('../models');
    const complaint = await Complaint.findByNumber(number);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    // Only return basic status information for public access
    res.json({
      success: true,
      data: {
        complaint: {
          complaint_number: complaint.complaint_number,
          status: complaint.status,
          submitted_at: complaint.submitted_at,
          last_updated: complaint.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Get complaint status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaint status'
    });
  }
});

/**
 * @route   GET /api/public/faq
 * @desc    Get frequently asked questions
 * @access  Public
 */
router.get('/faq', (req, res) => {
  const faq = [
    {
      question: "How do I file a complaint?",
      answer: "You can file a complaint by registering on our platform and using the complaint submission form. Provide all necessary details and evidence."
    },
    {
      question: "What types of cyber crimes can I report?",
      answer: "You can report various cyber crimes including financial fraud, identity theft, online harassment, data breaches, phishing, malware attacks, and more."
    },
    {
      question: "How long does it take to resolve a complaint?",
      answer: "Resolution time varies based on the complexity and severity of the case. High priority cases are typically resolved within 24-72 hours."
    },
    {
      question: "Can I file an anonymous complaint?",
      answer: "Yes, anonymous complaints are allowed for certain types of cyber crimes. However, providing contact information helps us investigate more effectively."
    },
    {
      question: "How can I track my complaint status?",
      answer: "You can track your complaint status by logging into your account or using the public complaint status checker with your complaint number."
    }
  ];
  
  res.json({
    success: true,
    data: {
      faq
    }
  });
});

/**
 * @route   GET /api/public/contact-info
 * @desc    Get contact information
 * @access  Public
 */
router.get('/contact-info', (req, res) => {
  const contactInfo = {
    office: {
      name: "District Cyber Crime Branch",
      address: "Cyber Crime Investigation Cell, District Police Office",
      phone: "+91-XXX-XXXXXXX",
      email: "cybercrime@district.police.gov.in",
      emergency: "100"
    },
    office_hours: {
      monday_friday: "9:00 AM - 6:00 PM",
      saturday: "9:00 AM - 2:00 PM",
      sunday: "Closed (Emergency cases only)"
    },
    helpline: {
      cyber_crime: "1930",
      women_helpline: "181",
      child_helpline: "1098"
    }
  };
  
  res.json({
    success: true,
    data: {
      contact_info: contactInfo
    }
  });
});

module.exports = router;