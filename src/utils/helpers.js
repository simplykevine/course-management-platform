const crypto = require('crypto');

/**
 * Generate a random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

/**
 * Calculate pagination offset
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {number} Offset value
 */
const calculateOffset = (page, limit) => {
  return (page - 1) * limit;
};

/**
 * Format pagination response
 * @param {number} total - Total items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} Pagination metadata
 */
const formatPaginationResponse = (total, page, limit) => {
  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  };
};

/**
 * Generate employee ID
 * @param {string} prefix - ID prefix
 * @returns {string} Employee ID
 */
const generateEmployeeId = (prefix = 'EMP') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

/**
 * Generate student ID
 * @param {number} year - Enrollment year
 * @returns {string} Student ID
 */
const generateStudentId = (year = new Date().getFullYear()) => {
  const random = Math.floor(Math.random() * 90000) + 10000;
  return `${year}${random}`;
};

/**
 * Calculate week number from dates
 * @param {Date} startDate - Course start date
 * @param {Date} currentDate - Current date
 * @returns {number} Week number
 */
const calculateWeekNumber = (startDate, currentDate = new Date()) => {
  const start = new Date(startDate);
  const current = new Date(currentDate);
  
  // Calculate the difference in milliseconds
  const diffTime = current - start;
  
  // If current date is before start date, return 0
  if (diffTime < 0) {
    return 0;
  }
  
  // Convert to days and then to weeks
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(diffDays / 7) + 1;
  
  return weekNumber;
};

/**
 * Validate date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {boolean} Is valid range
 */
const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Sleep function for delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Sanitize input string
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Check if user has role
 * @param {object} user - User object
 * @param {string[]} allowedRoles - Allowed roles
 * @returns {boolean} Has role
 */
const hasRole = (user, allowedRoles) => {
  return allowedRoles.includes(user.role);
};

/**
 * Parse boolean from string
 * @param {string} value - String value
 * @returns {boolean} Boolean value
 */
const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === '1' || value === 'yes';
};

module.exports = {
  generateRandomString,
  calculateOffset,
  formatPaginationResponse,
  generateEmployeeId,
  generateStudentId,
  calculateWeekNumber,
  isValidDateRange,
  formatDate,
  sleep,
  sanitizeInput,
  hasRole,
  parseBoolean
};