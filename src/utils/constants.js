module.exports = {
  // User roles
  ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    FACILITATOR: 'facilitator',
    STUDENT: 'student'
  },

  // Course status
  COURSE_STATUS: {
    PLANNED: 'planned',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // Activity status
  ACTIVITY_STATUS: {
    DONE: 'Done',
    PENDING: 'Pending',
    NOT_STARTED: 'Not Started'
  },

  // Intake periods
  INTAKE_PERIODS: {
    HT1: 'HT1',
    HT2: 'HT2',
    FT: 'FT'
  },

  // Mode types
  MODE_TYPES: {
    ONLINE: 'Online',
    IN_PERSON: 'In-person',
    HYBRID: 'Hybrid'
  },

  // Student status
  STUDENT_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    GRADUATED: 'graduated',
    WITHDRAWN: 'withdrawn'
  },

  // Management levels
  MANAGEMENT_LEVELS: {
    SENIOR: 'senior',
    MIDDLE: 'middle',
    JUNIOR: 'junior'
  },

  // Module levels
  MODULE_LEVELS: ['100', '200', '300', '400', '500', '600'],

  // Validation limits
  LIMITS: {
    MAX_WEEKS: 16,
    MAX_TRIMESTER: 3,
    MIN_TRIMESTER: 1,
    MAX_STUDENTS: 500,
    MIN_STUDENTS: 1,
    MAX_COURSE_LOAD: 10,
    MIN_PASSWORD_LENGTH: 8,
    MAX_NAME_LENGTH: 100,
    MIN_NAME_LENGTH: 2,
    MAX_EMAIL_LENGTH: 255,
    PAGINATION_DEFAULT_LIMIT: 10,
    PAGINATION_MAX_LIMIT: 100
  },

  // Notification types
  NOTIFICATION_TYPES: {
    ACTIVITY_REMINDER: 'activity-reminder',
    ACTIVITY_SUBMITTED: 'activity-submitted',
    DEADLINE_MISSED: 'deadline-missed',
    COURSE_UPDATE: 'course-update',
    EMAIL: 'email'
  },

  // HTTP status codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
  },

  // Error messages
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'Access denied',
    NOT_FOUND: 'Resource not found',
    VALIDATION_FAILED: 'Validation failed',
    DUPLICATE_ENTRY: 'Resource already exists',
    INTERNAL_ERROR: 'An unexpected error occurred'
  },

  // Success messages
  SUCCESS_MESSAGES: {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful'
  }
};