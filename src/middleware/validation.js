const { body, param, query, validationResult } = require('express-validator');

// Validation rules
const validationRules = {
  // Auth validations
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('First name must be between 2 and 100 characters'),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Last name must be between 2 and 100 characters'),
    body('role')
      .isIn(['admin', 'manager', 'facilitator', 'student'])
      .withMessage('Invalid role')
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  // Course validations
  createCourseOffering: [
    body('moduleId')
      .isInt({ min: 1 })
      .withMessage('Valid module ID is required'),
    body('classId')
      .isInt({ min: 1 })
      .withMessage('Valid class ID is required'),
    body('cohortId')
      .isInt({ min: 1 })
      .withMessage('Valid cohort ID is required'),
    body('facilitatorId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Valid facilitator ID is required'),
    body('modeId')
      .isInt({ min: 1 })
      .withMessage('Valid mode ID is required'),
    body('trimester')
      .isInt({ min: 1, max: 3 })
      .withMessage('Trimester must be between 1 and 3'),
    body('intakePeriod')
      .isIn(['HT1', 'HT2', 'FT'])
      .withMessage('Invalid intake period'),
    body('startDate')
      .isISO8601()
      .withMessage('Valid start date is required'),
    body('endDate')
      .isISO8601()
      .withMessage('Valid end date is required')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    body('maxStudents')
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage('Max students must be between 1 and 500')
  ],

  updateCourseOffering: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Valid course offering ID is required'),
    body('facilitatorId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Valid facilitator ID is required'),
    body('status')
      .optional()
      .isIn(['planned', 'active', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
    body('maxStudents')
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage('Max students must be between 1 and 500')
  ],

  // Activity validations
  createActivityLog: [
    body('allocationId')
      .isInt({ min: 1 })
      .withMessage('Valid allocation ID is required'),
    body('weekNumber')
      .isInt({ min: 1, max: 16 })
      .withMessage('Week number must be between 1 and 16'),
    body('attendance')
      .isArray()
      .withMessage('Attendance must be an array')
      .custom((value) => {
        if (!value.every(item => typeof item === 'boolean')) {
          throw new Error('All attendance values must be boolean');
        }
        return true;
      }),
    body('formativeOneGrading')
      .optional()
      .isIn(['Done', 'Pending', 'Not Started'])
      .withMessage('Invalid grading status'),
    body('formativeTwoGrading')
      .optional()
      .isIn(['Done', 'Pending', 'Not Started'])
      .withMessage('Invalid grading status'),
    body('summativeGrading')
      .optional()
      .isIn(['Done', 'Pending', 'Not Started'])
      .withMessage('Invalid grading status'),
    body('courseModeration')
      .optional()
      .isIn(['Done', 'Pending', 'Not Started'])
      .withMessage('Invalid moderation status'),
    body('intranetSync')
      .optional()
      .isIn(['Done', 'Pending', 'Not Started'])
      .withMessage('Invalid sync status'),
    body('gradeBookStatus')
      .optional()
      .isIn(['Done', 'Pending', 'Not Started'])
      .withMessage('Invalid gradebook status')
  ],

  // Query validations
  paginationQuery: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],

  courseFilters: [
    query('trimester')
      .optional()
      .isInt({ min: 1, max: 3 })
      .withMessage('Trimester must be between 1 and 3'),
    query('cohortId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Valid cohort ID is required'),
    query('facilitatorId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Valid facilitator ID is required'),
    query('intakePeriod')
      .optional()
      .isIn(['HT1', 'HT2', 'FT'])
      .withMessage('Invalid intake period'),
    query('modeId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Valid mode ID is required'),
    query('status')
      .optional()
      .isIn(['planned', 'active', 'completed', 'cancelled'])
      .withMessage('Invalid status')
  ],

  // ID parameter validation
  idParam: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Valid ID is required')
  ]
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Combine validation rules with error handler
const validate = (validationName) => {
  if (!validationRules[validationName]) {
    throw new Error(`Validation rules for ${validationName} not found`);
  }
  return [...validationRules[validationName], handleValidationErrors];
};

module.exports = {
  validate,
  validationRules,
  handleValidationErrors
};