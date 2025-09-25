const { ComplaintType } = require('../models');

const complaintTypes = [
  {
    name: 'financial_fraud',
    display_name: 'Financial Fraud',
    description: 'Online banking fraud, credit card fraud, UPI fraud, and other financial crimes',
    category: 'financial_fraud',
    severity_level: 'high',
    priority_score: 85,
    sla_hours: 24,
    required_fields: ['transaction_details', 'bank_details', 'amount_lost'],
    form_schema: {
      transaction_details: {
        type: 'object',
        required: true,
        fields: {
          transaction_id: { type: 'string', required: true },
          transaction_date: { type: 'date', required: true },
          amount: { type: 'number', required: true },
          bank_name: { type: 'string', required: true }
        }
      },
      bank_details: {
        type: 'object',
        required: true,
        fields: {
          account_number: { type: 'string', required: true },
          ifsc_code: { type: 'string', required: true }
        }
      }
    },
    is_active: true,
    is_public: true,
    allows_anonymous: false,
    max_evidence_files: 10,
    allowed_evidence_types: ['image', 'document', 'video'],
    workflow_stages: ['submitted', 'under_review', 'investigation', 'bank_contacted', 'action_taken', 'closed']
  },
  {
    name: 'identity_theft',
    display_name: 'Identity Theft',
    description: 'Unauthorized use of personal information, fake profiles, impersonation',
    category: 'identity_theft',
    severity_level: 'high',
    priority_score: 80,
    sla_hours: 48,
    required_fields: ['identity_details', 'misuse_description'],
    form_schema: {
      identity_details: {
        type: 'object',
        required: true,
        fields: {
          document_type: { type: 'string', required: true, enum: ['aadhaar', 'pan', 'passport', 'driving_license'] },
          document_number: { type: 'string', required: true }
        }
      }
    },
    is_active: true,
    is_public: true,
    allows_anonymous: false,
    max_evidence_files: 15,
    allowed_evidence_types: ['image', 'document', 'video']
  },
  {
    name: 'online_harassment',
    display_name: 'Online Harassment',
    description: 'Cyberbullying, stalking, threats, and harassment on digital platforms',
    category: 'online_harassment',
    severity_level: 'medium',
    priority_score: 70,
    sla_hours: 72,
    required_fields: ['platform_details', 'harassment_type'],
    form_schema: {
      platform_details: {
        type: 'object',
        required: true,
        fields: {
          platform_name: { type: 'string', required: true },
          profile_url: { type: 'string', required: false },
          username: { type: 'string', required: false }
        }
      },
      harassment_type: {
        type: 'string',
        required: true,
        enum: ['cyberbullying', 'stalking', 'threats', 'defamation', 'other']
      }
    },
    is_active: true,
    is_public: true,
    allows_anonymous: true,
    max_evidence_files: 20,
    allowed_evidence_types: ['image', 'video', 'audio']
  },
  {
    name: 'data_breach',
    display_name: 'Data Breach',
    description: 'Unauthorized access to personal or organizational data',
    category: 'data_breach',
    severity_level: 'critical',
    priority_score: 95,
    sla_hours: 12,
    required_fields: ['breach_details', 'affected_data'],
    form_schema: {
      breach_details: {
        type: 'object',
        required: true,
        fields: {
          organization_name: { type: 'string', required: true },
          breach_date: { type: 'date', required: true },
          discovery_date: { type: 'date', required: true }
        }
      },
      affected_data: {
        type: 'array',
        required: true,
        items: {
          type: 'string',
          enum: ['personal_info', 'financial_data', 'health_records', 'business_data', 'other']
        }
      }
    },
    is_active: true,
    is_public: true,
    allows_anonymous: false,
    max_evidence_files: 25,
    allowed_evidence_types: ['document', 'image']
  },
  {
    name: 'phishing',
    display_name: 'Phishing Attack',
    description: 'Fraudulent emails, messages, or websites designed to steal information',
    category: 'phishing',
    severity_level: 'medium',
    priority_score: 65,
    sla_hours: 48,
    required_fields: ['phishing_details'],
    form_schema: {
      phishing_details: {
        type: 'object',
        required: true,
        fields: {
          attack_type: { type: 'string', required: true, enum: ['email', 'sms', 'website', 'social_media'] },
          sender_info: { type: 'string', required: false },
          target_info: { type: 'string', required: false }
        }
      }
    },
    is_active: true,
    is_public: true,
    allows_anonymous: true,
    max_evidence_files: 10,
    allowed_evidence_types: ['image', 'document']
  },
  {
    name: 'malware',
    display_name: 'Malware Attack',
    description: 'Virus, ransomware, spyware, and other malicious software attacks',
    category: 'malware',
    severity_level: 'high',
    priority_score: 75,
    sla_hours: 36,
    required_fields: ['malware_details', 'system_info'],
    form_schema: {
      malware_details: {
        type: 'object',
        required: true,
        fields: {
          malware_type: { type: 'string', required: true, enum: ['virus', 'ransomware', 'spyware', 'trojan', 'other'] },
          infection_date: { type: 'date', required: true }
        }
      },
      system_info: {
        type: 'object',
        required: true,
        fields: {
          operating_system: { type: 'string', required: true },
          antivirus_software: { type: 'string', required: false }
        }
      }
    },
    is_active: true,
    is_public: true,
    allows_anonymous: false,
    max_evidence_files: 15,
    allowed_evidence_types: ['image', 'document', 'log_file']
  },
  {
    name: 'social_media_crime',
    display_name: 'Social Media Crime',
    description: 'Crimes committed through social media platforms',
    category: 'social_media_crime',
    severity_level: 'medium',
    priority_score: 60,
    sla_hours: 72,
    required_fields: ['platform_info', 'crime_type'],
    form_schema: {
      platform_info: {
        type: 'object',
        required: true,
        fields: {
          platform_name: { type: 'string', required: true },
          account_url: { type: 'string', required: false }
        }
      },
      crime_type: {
        type: 'string',
        required: true,
        enum: ['fake_profile', 'impersonation', 'fraud', 'harassment', 'other']
      }
    },
    is_active: true,
    is_public: true,
    allows_anonymous: true,
    max_evidence_files: 20,
    allowed_evidence_types: ['image', 'video', 'document']
  },
  {
    name: 'e_commerce_fraud',
    display_name: 'E-commerce Fraud',
    description: 'Online shopping fraud, fake websites, non-delivery of goods',
    category: 'e_commerce_fraud',
    severity_level: 'medium',
    priority_score: 55,
    sla_hours: 96,
    required_fields: ['transaction_info', 'merchant_details'],
    form_schema: {
      transaction_info: {
        type: 'object',
        required: true,
        fields: {
          order_id: { type: 'string', required: true },
          amount_paid: { type: 'number', required: true },
          payment_method: { type: 'string', required: true }
        }
      },
      merchant_details: {
        type: 'object',
        required: true,
        fields: {
          website_url: { type: 'string', required: true },
          merchant_name: { type: 'string', required: true }
        }
      }
    },
    is_active: true,
    is_public: true,
    allows_anonymous: false,
    max_evidence_files: 10,
    allowed_evidence_types: ['image', 'document']
  },
  {
    name: 'child_exploitation',
    display_name: 'Child Exploitation',
    description: 'Online child abuse, exploitation, and related crimes',
    category: 'child_exploitation',
    severity_level: 'critical',
    priority_score: 100,
    sla_hours: 6,
    required_fields: ['incident_details'],
    form_schema: {
      incident_details: {
        type: 'object',
        required: true,
        fields: {
          platform_type: { type: 'string', required: true },
          content_type: { type: 'string', required: true }
        }
      }
    },
    is_active: true,
    is_public: true,
    allows_anonymous: true,
    max_evidence_files: 30,
    allowed_evidence_types: ['image', 'video', 'document'],
    requires_verification: true
  },
  {
    name: 'other_cybercrime',
    display_name: 'Other Cyber Crime',
    description: 'Other types of cyber crimes not covered in specific categories',
    category: 'other',
    severity_level: 'medium',
    priority_score: 50,
    sla_hours: 120,
    required_fields: ['crime_description'],
    form_schema: {
      crime_description: {
        type: 'string',
        required: true,
        minLength: 100
      }
    },
    is_active: true,
    is_public: true,
    allows_anonymous: true,
    max_evidence_files: 15,
    allowed_evidence_types: ['image', 'document', 'video', 'audio']
  }
];

const seedComplaintTypes = async () => {
  try {
    console.log('📋 Seeding complaint types...');

    for (const typeData of complaintTypes) {
      const [complaintType, created] = await ComplaintType.findOrCreate({
        where: { name: typeData.name },
        defaults: typeData
      });

      if (created) {
        console.log(`✅ Created complaint type: ${complaintType.display_name}`);
      } else {
        console.log(`⏭️  Complaint type already exists: ${complaintType.display_name}`);
      }
    }

    console.log('✅ Complaint types seeding completed');
  } catch (error) {
    console.error('❌ Error seeding complaint types:', error);
    throw error;
  }
};

module.exports = seedComplaintTypes;