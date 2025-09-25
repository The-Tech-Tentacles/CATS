const crypto = require('crypto');
const config = require('../config');

const ALGORITHM = config.encryption.algorithm;
const SECRET_KEY = config.encryption.key;

// Ensure the secret key is 32 bytes for AES-256
const KEY = crypto.scryptSync(SECRET_KEY, 'salt', 32);

/**
 * Encrypt text using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @returns {string} - Encrypted text with IV and auth tag
 */
function encrypt(text) {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipherGCM(ALGORITHM, KEY, iv);
    cipher.setAAD(Buffer.from('CATS-System', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine IV, auth tag, and encrypted data
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt text using AES-256-GCM
 * @param {string} encryptedText - Encrypted text with IV and auth tag
 * @returns {string} - Decrypted text
 */
function decrypt(encryptedText) {
  if (!encryptedText) return encryptedText;
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipherGCM(ALGORITHM, KEY, iv);
    decipher.setAAD(Buffer.from('CATS-System', 'utf8'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @param {number} rounds - Salt rounds (default: 12)
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password, rounds = 12) {
  const bcrypt = require('bcryptjs');
  return bcrypt.hash(password, rounds);
}

/**
 * Verify password against hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if password matches
 */
async function verifyPassword(password, hash) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(password, hash);
}

/**
 * Generate secure random token
 * @param {number} length - Token length in bytes (default: 32)
 * @returns {string} - Random token in hex format
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate secure random string
 * @param {number} length - String length (default: 16)
 * @param {string} charset - Character set to use
 * @returns {string} - Random string
 */
function generateRandomString(length = 16, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = '';
  const charsetLength = charset.length;
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charsetLength);
    result += charset[randomIndex];
  }
  
  return result;
}

/**
 * Generate file hash (SHA-256)
 * @param {Buffer|string} data - File data or path
 * @returns {string} - SHA-256 hash in hex format
 */
function generateFileHash(data) {
  const hash = crypto.createHash('sha256');
  
  if (Buffer.isBuffer(data)) {
    hash.update(data);
  } else if (typeof data === 'string') {
    hash.update(data, 'utf8');
  } else {
    throw new Error('Invalid data type for hashing');
  }
  
  return hash.digest('hex');
}

/**
 * Generate MD5 checksum
 * @param {Buffer|string} data - Data to checksum
 * @returns {string} - MD5 checksum in hex format
 */
function generateChecksum(data) {
  const hash = crypto.createHash('md5');
  
  if (Buffer.isBuffer(data)) {
    hash.update(data);
  } else if (typeof data === 'string') {
    hash.update(data, 'utf8');
  } else {
    throw new Error('Invalid data type for checksum');
  }
  
  return hash.digest('hex');
}

/**
 * Generate HMAC signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @param {string} algorithm - HMAC algorithm (default: sha256)
 * @returns {string} - HMAC signature in hex format
 */
function generateHMAC(data, secret, algorithm = 'sha256') {
  const hmac = crypto.createHmac(algorithm, secret);
  hmac.update(data);
  return hmac.digest('hex');
}

/**
 * Verify HMAC signature
 * @param {string} data - Original data
 * @param {string} signature - HMAC signature to verify
 * @param {string} secret - Secret key
 * @param {string} algorithm - HMAC algorithm (default: sha256)
 * @returns {boolean} - True if signature is valid
 */
function verifyHMAC(data, signature, secret, algorithm = 'sha256') {
  const expectedSignature = generateHMAC(data, secret, algorithm);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Encrypt sensitive fields in an object
 * @param {Object} obj - Object with fields to encrypt
 * @param {Array} fields - Array of field names to encrypt
 * @returns {Object} - Object with encrypted fields
 */
function encryptFields(obj, fields) {
  const result = { ...obj };
  
  fields.forEach(field => {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = encrypt(result[field]);
    }
  });
  
  return result;
}

/**
 * Decrypt sensitive fields in an object
 * @param {Object} obj - Object with encrypted fields
 * @param {Array} fields - Array of field names to decrypt
 * @returns {Object} - Object with decrypted fields
 */
function decryptFields(obj, fields) {
  const result = { ...obj };
  
  fields.forEach(field => {
    if (result[field] && typeof result[field] === 'string') {
      try {
        result[field] = decrypt(result[field]);
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error);
        result[field] = '[DECRYPTION_ERROR]';
      }
    }
  });
  
  return result;
}

/**
 * Generate cryptographically secure UUID
 * @returns {string} - UUID v4
 */
function generateUUID() {
  return crypto.randomUUID();
}

/**
 * Mask sensitive data for logging
 * @param {string} data - Sensitive data to mask
 * @param {number} visibleChars - Number of characters to show (default: 4)
 * @returns {string} - Masked data
 */
function maskSensitiveData(data, visibleChars = 4) {
  if (!data || typeof data !== 'string') return data;
  
  if (data.length <= visibleChars) {
    return '*'.repeat(data.length);
  }
  
  const visible = data.substring(0, visibleChars);
  const masked = '*'.repeat(data.length - visibleChars);
  
  return visible + masked;
}

/**
 * Sanitize data for safe storage/transmission
 * @param {any} data - Data to sanitize
 * @returns {any} - Sanitized data
 */
function sanitizeData(data) {
  if (typeof data === 'string') {
    // Remove null bytes and control characters
    return data.replace(/[\x00-\x1F\x7F]/g, '');
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  
  if (data && typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeData(value);
    }
    return sanitized;
  }
  
  return data;
}

module.exports = {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  generateToken,
  generateRandomString,
  generateFileHash,
  generateChecksum,
  generateHMAC,
  verifyHMAC,
  encryptFields,
  decryptFields,
  generateUUID,
  maskSensitiveData,
  sanitizeData
};