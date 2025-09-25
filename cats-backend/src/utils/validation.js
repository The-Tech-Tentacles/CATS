const validator = require('validator');
const sanitizeHtml = require('sanitize-html');

/**
 * Validation utility functions for CATS backend
 */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return validator.isEmail(email) && email.length <= 254;
}

/**
 * Validate Indian phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
function isValidPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Indian phone number patterns
  const patterns = [
    /^[6-9]\d{9}$/, // 10-digit mobile number
    /^91[6-9]\d{9}$/, // With country code
    /^(\+91)?[6-9]\d{9}$/, // With optional +91
    /^0[1-9]\d{8,9}$/ // Landline with STD code
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * Validate Aadhaar number
 * @param {string} aadhaar - Aadhaar number to validate
 * @returns {boolean} - True if valid
 */
function isValidAadhaar(aadhaar) {
  if (!aadhaar || typeof aadhaar !== 'string') return false;
  
  // Remove spaces and hyphens
  const cleaned = aadhaar.replace(/[\s-]/g, '');
  
  // Must be 12 digits
  if (!/^\d{12}$/.test(cleaned)) return false;
  
  // Aadhaar checksum validation (Verhoeff algorithm)
  return verifyAadhaarChecksum(cleaned);
}

/**
 * Verify Aadhaar checksum using Verhoeff algorithm
 * @param {string} aadhaar - 12-digit Aadhaar number
 * @returns {boolean} - True if checksum is valid
 */
function verifyAadhaarChecksum(aadhaar) {
  const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  ];
  
  const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
  ];
  
  let c = 0;
  const reversedAadhaar = aadhaar.split('').reverse();
  
  for (let i = 0; i < reversedAadhaar.length; i++) {
    c = d[c][p[i % 8][parseInt(reversedAadhaar[i])]];
  }
  
  return c === 0;
}

/**
 * Validate PAN number
 * @param {string} pan - PAN number to validate
 * @returns {boolean} - True if valid
 */
function isValidPAN(pan) {
  if (!pan || typeof pan !== 'string') return false;
  
  // PAN format: AAAAA9999A
  const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panPattern.test(pan.toUpperCase());
}

/**
 * Validate Indian PIN code
 * @param {string} pincode - PIN code to validate
 * @returns {boolean} - True if valid
 */
function isValidPincode(pincode) {
  if (!pincode || typeof pincode !== 'string') return false;
  
  // Indian PIN code is 6 digits
  const pincodePattern = /^[1-9][0-9]{5}$/;
  return pincodePattern.test(pincode);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with score and feedback
 */
function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, score: 0, feedback: ['Password is required'] };
  }
  
  const feedback = [];
  let score = 0;
  
  // Length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Password must contain lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Password must contain uppercase letters');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Password must contain numbers');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 2;
  else feedback.push('Password must contain special characters');
  
  // Common patterns check
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Password should not contain repeated characters');
    score -= 1;
  }
  
  if (/123|abc|qwe|password|admin/i.test(password)) {
    feedback.push('Password should not contain common patterns');
    score -= 2;
  }
  
  const isValid = score >= 5 && feedback.length === 0;
  
  return {
    isValid,
    score: Math.max(0, score),
    strength: score >= 7 ? 'strong' : score >= 5 ? 'medium' : 'weak',
    feedback
  };
}

/**
 * Validate file upload
 * @param {Object} file - File object from multer
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
function validateFileUpload(file, options = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  } = options;
  
  const errors = [];
  
  if (!file) {
    return { isValid: false, errors: ['No file provided'] };
  }
  
  // Size validation
  if (file.size > maxSize) {
    errors.push(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
  }
  
  // File extension validation
  const fileExtension = file.originalname.split('.').pop().toLowerCase();
  if (!allowedTypes.includes(fileExtension)) {
    errors.push(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  // MIME type validation
  if (!allowedMimeTypes.includes(file.mimetype)) {
    errors.push(`MIME type ${file.mimetype} is not allowed`);
  }
  
  // Filename validation
  if (!/^[a-zA-Z0-9._-]+$/.test(file.originalname)) {
    errors.push('Filename contains invalid characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize HTML content
 * @param {string} html - HTML content to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} - Sanitized HTML
 */
function sanitizeHTML(html, options = {}) {
  if (!html || typeof html !== 'string') return '';
  
  const defaultOptions = {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    allowedAttributes: {},
    allowedSchemes: ['http', 'https', 'mailto'],
    disallowedTagsMode: 'discard'
  };
  
  return sanitizeHtml(html, { ...defaultOptions, ...options });
}

/**
 * Validate and sanitize input data
 * @param {any} data - Data to validate and sanitize
 * @param {Object} schema - Validation schema
 * @returns {Object} - Validation result
 */
function validateAndSanitize(data, schema) {
  const errors = [];
  const sanitized = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Required field check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    // Skip validation if field is not required and empty
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    let sanitizedValue = value;
    
    // Type validation and conversion
    if (rules.type) {
      switch (rules.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${field} must be a string`);
            continue;
          }
          sanitizedValue = value.trim();
          break;
          
        case 'number':
          const num = Number(value);
          if (isNaN(num)) {
            errors.push(`${field} must be a number`);
            continue;
          }
          sanitizedValue = num;
          break;
          
        case 'email':
          if (!isValidEmail(value)) {
            errors.push(`${field} must be a valid email address`);
            continue;
          }
          sanitizedValue = value.toLowerCase().trim();
          break;
          
        case 'phone':
          if (!isValidPhoneNumber(value)) {
            errors.push(`${field} must be a valid phone number`);
            continue;
          }
          sanitizedValue = value.replace(/\D/g, '');
          break;
          
        case 'aadhaar':
          if (!isValidAadhaar(value)) {
            errors.push(`${field} must be a valid Aadhaar number`);
            continue;
          }
          sanitizedValue = value.replace(/[\s-]/g, '');
          break;
          
        case 'pan':
          if (!isValidPAN(value)) {
            errors.push(`${field} must be a valid PAN number`);
            continue;
          }
          sanitizedValue = value.toUpperCase().trim();
          break;
      }
    }
    
    // Length validation
    if (rules.minLength && sanitizedValue.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters long`);
    }
    
    if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
      errors.push(`${field} must not exceed ${rules.maxLength} characters`);
    }
    
    // Pattern validation
    if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
      errors.push(`${field} format is invalid`);
    }
    
    // Enum validation
    if (rules.enum && !rules.enum.includes(sanitizedValue)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }
    
    // Custom validation
    if (rules.validate && typeof rules.validate === 'function') {
      const customResult = rules.validate(sanitizedValue);
      if (customResult !== true) {
        errors.push(customResult || `${field} is invalid`);
      }
    }
    
    // HTML sanitization
    if (rules.sanitizeHTML) {
      sanitizedValue = sanitizeHTML(sanitizedValue);
    }
    
    sanitized[field] = sanitizedValue;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data: sanitized
  };
}

/**
 * Validate complaint data
 * @param {Object} data - Complaint data to validate
 * @returns {Object} - Validation result
 */
function validateComplaintData(data) {
  const schema = {
    title: {
      required: true,
      type: 'string',
      minLength: 10,
      maxLength: 200,
      sanitizeHTML: true
    },
    description: {
      required: true,
      type: 'string',
      minLength: 50,
      maxLength: 5000,
      sanitizeHTML: true
    },
    complaint_type_id: {
      required: true,
      type: 'string',
      pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    },
    incident_date: {
      required: false,
      validate: (value) => {
        if (value && !validator.isISO8601(value)) {
          return 'Incident date must be a valid date';
        }
        return true;
      }
    },
    financial_loss: {
      required: false,
      type: 'number',
      validate: (value) => value >= 0 || 'Financial loss cannot be negative'
    }
  };
  
  return validateAndSanitize(data, schema);
}

/**
 * Validate application data
 * @param {Object} data - Application data to validate
 * @returns {Object} - Validation result
 */
function validateApplicationData(data) {
  const schema = {
    title: {
      required: true,
      type: 'string',
      minLength: 10,
      maxLength: 200,
      sanitizeHTML: true
    },
    description: {
      required: true,
      type: 'string',
      minLength: 50,
      maxLength: 2000,
      sanitizeHTML: true
    },
    purpose: {
      required: true,
      type: 'string',
      minLength: 20,
      maxLength: 1000,
      sanitizeHTML: true
    },
    type: {
      required: true,
      enum: [
        'noc_cyber_clearance',
        'character_verification',
        'cyber_security_audit',
        'digital_forensics',
        'awareness_program',
        'training_request',
        'consultation',
        'other'
      ]
    }
  };
  
  return validateAndSanitize(data, schema);
}

/**
 * Validate user registration data
 * @param {Object} data - User registration data to validate
 * @returns {Object} - Validation result
 */
function validateUserRegistration(data) {
  const schema = {
    email: {
      required: true,
      type: 'email'
    },
    password: {
      required: true,
      validate: (value) => {
        const result = validatePasswordStrength(value);
        return result.isValid || result.feedback.join(', ');
      }
    },
    first_name: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/
    },
    last_name: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/
    },
    phone_number: {
      required: true,
      type: 'phone'
    },
    aadhaar_number: {
      required: false,
      type: 'aadhaar'
    },
    pan_number: {
      required: false,
      type: 'pan'
    }
  };
  
  return validateAndSanitize(data, schema);
}

module.exports = {
  isValidEmail,
  isValidPhoneNumber,
  isValidAadhaar,
  isValidPAN,
  isValidPincode,
  validatePasswordStrength,
  validateFileUpload,
  sanitizeHTML,
  validateAndSanitize,
  validateComplaintData,
  validateApplicationData,
  validateUserRegistration,
  verifyAadhaarChecksum
};