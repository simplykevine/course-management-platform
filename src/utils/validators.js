/**
 * Custom validators for the application
 */

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} Is valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password
 * @returns {object} Validation result
 */
const validatePassword = (password) => {
  const result = {
    isValid: true,
    errors: []
  };

  if (password.length < 8) {
    result.errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    result.errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    result.errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    result.errors.push('Password must contain at least one number');
  }

  result.isValid = result.errors.length === 0;
  return result;
};

/**
 * Validate phone number
 * @param {string} phone - Phone number
 * @returns {boolean} Is valid phone
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate date format
 * @param {string} date - Date string
 * @returns {boolean} Is valid date
 */
const isValidDate = (date) => {
  const parsed = Date.parse(date);
  return !isNaN(parsed);
};

/**
 * Validate trimester value
 * @param {number} trimester - Trimester value
 * @returns {boolean} Is valid trimester
 */
const isValidTrimester = (trimester) => {
  return Number.isInteger(trimester) && trimester >= 1 && trimester <= 3;
};

/**
 * Validate week number
 * @param {number} week - Week number
 * @returns {boolean} Is valid week
 */
const isValidWeekNumber = (week) => {
  return Number.isInteger(week) && week >= 1 && week <= 16;
};

/**
 * Validate attendance array
 * @param {array} attendance - Attendance array
 * @returns {boolean} Is valid attendance array
 */
const isValidAttendanceArray = (attendance) => {
  if (!Array.isArray(attendance)) return false;
  return attendance.every(item => typeof item === 'boolean');
};

/**
 * Validate intake period
 * @param {string} intake - Intake period
 * @returns {boolean} Is valid intake
 */
const isValidIntakePeriod = (intake) => {
  return ['HT1', 'HT2', 'FT'].includes(intake);
};

/**
 * Validate student ID format
 * @param {string} studentId - Student ID
 * @returns {boolean} Is valid student ID
 */
const isValidStudentId = (studentId) => {
  const studentIdRegex = /^\d{9}$/;
  return studentIdRegex.test(studentId);
};

/**
 * Validate employee ID format
 * @param {string} employeeId - Employee ID
 * @returns {boolean} Is valid employee ID
 */
const isValidEmployeeId = (employeeId) => {
  const employeeIdRegex = /^EMP[A-Z0-9]{8,}$/;
  return employeeIdRegex.test(employeeId);
};

/**
 * Validate module code format
 * @param {string} code - Module code
 * @returns {boolean} Is valid module code
 */
const isValidModuleCode = (code) => {
  const moduleCodeRegex = /^[A-Z]{2,4}\d{3}$/;
  return moduleCodeRegex.test(code);
};

/**
 * Validate GPA value
 * @param {number} gpa - GPA value
 * @returns {boolean} Is valid GPA
 */
const isValidGPA = (gpa) => {
  return typeof gpa === 'number' && gpa >= 0 && gpa <= 4.0;
};

module.exports = {
  isValidEmail,
  validatePassword,
  isValidPhone,
  isValidDate,
  isValidTrimester,
  isValidWeekNumber,
  isValidAttendanceArray,
  isValidIntakePeriod,
  isValidStudentId,
  isValidEmployeeId,
  isValidModuleCode,
  isValidGPA
};